/**
 * Tests for the file-handling functions added/changed in the editor.vue PR.
 *
 * The functions under test are:
 *  - saveFileInTauri  (new)
 *  - saveToFile       (new)
 *  - exportMarkdown   (changed to async, now uses Tauri dialog + writeTextFile)
 *  - openFile         (changed: removed AbortError early-return)
 *
 * Because these live inside a <script setup> SFC they cannot be imported
 * directly, so the tests recreate the same logic using the same mock
 * boundaries (Tauri plugin-dialog, plugin-fs, isTauri, showSaveFilePicker).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Hoist mock functions so they can be referenced inside vi.mock factories
// ---------------------------------------------------------------------------
const { mockSave, mockIsTauri, mockWriteTextFile } = vi.hoisted(() => ({
  mockSave: vi.fn(),
  mockIsTauri: vi.fn(),
  mockWriteTextFile: vi.fn(),
}))

vi.mock('@tauri-apps/plugin-dialog', () => ({ save: mockSave }))
vi.mock('@tauri-apps/api/core', () => ({ isTauri: mockIsTauri }))
vi.mock('@tauri-apps/plugin-fs', () => ({
  writeTextFile: mockWriteTextFile,
  BaseDirectory: { AppData: 'AppData' },
}))

import { BaseDirectory, writeTextFile } from '@tauri-apps/plugin-fs'
import { save } from '@tauri-apps/plugin-dialog'
import { isTauri } from '@tauri-apps/api/core'

// ---------------------------------------------------------------------------
// Helpers / recreated functions (same logic as in editor.vue)
// ---------------------------------------------------------------------------

/**
 * Mirrors saveFileInTauri() from editor.vue.
 */
async function saveFileInTauri() {
  try {
    const path = await save()
    console.log(path)
  } catch (err) {
    console.error('Error saving file in Tauri:', err)
  }
}

/**
 * Mirrors saveToFile() from editor.vue.
 * getMarkdown replaces the editor.value?.storage.markdown.getMarkdown() call.
 * showSaveFilePickerImpl replaces (window as any).showSaveFilePicker.
 */
async function saveToFile(
  getMarkdown: () => string,
  showSaveFilePickerImpl: ((opts?: any) => Promise<any>) | undefined,
  { saveAs }: { saveAs?: boolean } = {}
) {
  try {
    if (await isTauri()) {
      await saveFileInTauri()
    } else if (typeof showSaveFilePickerImpl !== 'undefined') {
      const fileHandle = await showSaveFilePickerImpl({
        types: [
          {
            description: 'Markdown files',
            accept: { 'text/markdown': ['.md'] },
          },
        ],
      })
      const writable = await fileHandle.createWritable()
      const markdownContent = getMarkdown()
      await writable.write(markdownContent)
      await writable.close()
    }
  } catch (err) {
    console.error('Error saving file:', err)
  }
}

/**
 * Mirrors the core of exportMarkdown() from editor.vue.
 */
async function exportMarkdown(
  title: string,
  getMarkdown: () => string,
  showSaveFilePickerImpl: (opts?: any) => Promise<any>
): Promise<any> {
  const thePath = await save({
    title: 'Save File',
    defaultPath: title,
    filters: [{ name: 'Text Documents', extensions: ['md'] }],
  })

  const markdownContent = getMarkdown()

  if (thePath) {
    await writeTextFile(title, markdownContent, { baseDir: BaseDirectory.AppData })
  }

  const fileHandle = await showSaveFilePickerImpl()
  const writableStream = await fileHandle.createWritable()
  await writableStream.write(markdownContent)
  await writableStream.close()

  return fileHandle
}

/**
 * Mirrors openFile() error handling from editor.vue (post-PR: no
 * AbortError special-casing, all errors are logged via console.error).
 */
async function openFile(
  showOpenFilePickerImpl: (opts?: any) => Promise<any[]>,
  setContent: (text: string) => void
) {
  const pickerOpts = {
    types: [
      {
        description: 'Markdown / Text files',
        accept: { 'text/markdown': ['.md'], 'text/plain': ['.txt'] },
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
  }

  try {
    const [fileHandle] = await showOpenFilePickerImpl(pickerOpts)
    const fileData = await fileHandle.getFile()
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setContent(reader.result)
      }
    }

    reader.readAsText(fileData)
  } catch (err) {
    console.error('Error opening file:', err)
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('saveFileInTauri', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls save() from @tauri-apps/plugin-dialog and logs the returned path', async () => {
    mockSave.mockResolvedValueOnce('/home/user/notes.md')
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await saveFileInTauri()

    expect(mockSave).toHaveBeenCalledTimes(1)
    expect(consoleSpy).toHaveBeenCalledWith('/home/user/notes.md')

    consoleSpy.mockRestore()
  })

  it('logs an error when save() rejects', async () => {
    const saveError = new Error('dialog cancelled')
    mockSave.mockRejectedValueOnce(saveError)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await saveFileInTauri()

    expect(errorSpy).toHaveBeenCalledWith('Error saving file in Tauri:', saveError)
    errorSpy.mockRestore()
  })

  it('handles save() resolving with null (user dismisses dialog)', async () => {
    mockSave.mockResolvedValueOnce(null)
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await saveFileInTauri()

    expect(consoleSpy).toHaveBeenCalledWith(null)
    consoleSpy.mockRestore()
  })
})

describe('saveToFile', () => {
  beforeEach(() => vi.clearAllMocks())

  it('delegates to saveFileInTauri (via save()) when isTauri() is true', async () => {
    mockIsTauri.mockResolvedValueOnce(true)
    mockSave.mockResolvedValueOnce('/tmp/notes.md')
    vi.spyOn(console, 'log').mockImplementation(() => {})

    await saveToFile(() => '# content', undefined)

    expect(mockIsTauri).toHaveBeenCalledTimes(1)
    expect(mockSave).toHaveBeenCalledTimes(1)
  })

  it('uses showSaveFilePicker when not in Tauri and the API exists', async () => {
    mockIsTauri.mockResolvedValueOnce(false)
    const mockClose = vi.fn().mockResolvedValue(undefined)
    const mockWrite = vi.fn().mockResolvedValue(undefined)
    const mockCreateWritable = vi.fn().mockResolvedValue({ write: mockWrite, close: mockClose })
    const mockFileHandle = { createWritable: mockCreateWritable }
    const mockPicker = vi.fn().mockResolvedValue(mockFileHandle)

    const markdown = '# Hello world'
    await saveToFile(() => markdown, mockPicker)

    expect(mockPicker).toHaveBeenCalledWith({
      types: [{ description: 'Markdown files', accept: { 'text/markdown': ['.md'] } }],
    })
    expect(mockCreateWritable).toHaveBeenCalledTimes(1)
    expect(mockWrite).toHaveBeenCalledWith(markdown)
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it('does nothing when not in Tauri and showSaveFilePicker is not available', async () => {
    mockIsTauri.mockResolvedValueOnce(false)

    await expect(saveToFile(() => '', undefined)).resolves.toBeUndefined()
    expect(mockSave).not.toHaveBeenCalled()
  })

  it('logs error and does not throw when showSaveFilePicker rejects', async () => {
    mockIsTauri.mockResolvedValueOnce(false)
    const pickerError = new Error('user cancelled')
    const mockPicker = vi.fn().mockRejectedValue(pickerError)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await saveToFile(() => '', mockPicker)

    expect(errorSpy).toHaveBeenCalledWith('Error saving file:', pickerError)
    errorSpy.mockRestore()
  })

  it('accepts the saveAs flag without errors', async () => {
    mockIsTauri.mockResolvedValueOnce(true)
    mockSave.mockResolvedValueOnce('/tmp/doc.md')
    vi.spyOn(console, 'log').mockImplementation(() => {})

    await expect(saveToFile(() => '', undefined, { saveAs: true })).resolves.toBeUndefined()
  })
})

describe('exportMarkdown', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls save() with the correct options (title, defaultPath, md filter)', async () => {
    const title = 'My Notes'
    const markdown = '# Hello'
    mockSave.mockResolvedValueOnce('/tmp/My Notes.md')
    const mockClose = vi.fn().mockResolvedValue(undefined)
    const mockWrite = vi.fn().mockResolvedValue(undefined)
    const mockFileHandle = {
      createWritable: vi.fn().mockResolvedValue({ write: mockWrite, close: mockClose }),
    }
    const mockPicker = vi.fn().mockResolvedValue(mockFileHandle)

    const result = await exportMarkdown(title, () => markdown, mockPicker)

    expect(mockSave).toHaveBeenCalledWith({
      title: 'Save File',
      defaultPath: title,
      filters: [{ name: 'Text Documents', extensions: ['md'] }],
    })
    expect(result).toBe(mockFileHandle)
  })

  it('calls writeTextFile with correct args when save() returns a path', async () => {
    const title = 'note'
    const markdown = '## Section'
    mockSave.mockResolvedValueOnce('/data/note.md')
    mockWriteTextFile.mockResolvedValueOnce(undefined)
    const mockClose = vi.fn().mockResolvedValue(undefined)
    const mockWrite = vi.fn().mockResolvedValue(undefined)
    const mockFileHandle = {
      createWritable: vi.fn().mockResolvedValue({ write: mockWrite, close: mockClose }),
    }
    const mockPicker = vi.fn().mockResolvedValue(mockFileHandle)

    await exportMarkdown(title, () => markdown, mockPicker)

    expect(mockWriteTextFile).toHaveBeenCalledWith(title, markdown, {
      baseDir: BaseDirectory.AppData,
    })
  })

  it('skips writeTextFile when save() returns null (user cancelled dialog)', async () => {
    mockSave.mockResolvedValueOnce(null)
    const mockClose = vi.fn().mockResolvedValue(undefined)
    const mockWrite = vi.fn().mockResolvedValue(undefined)
    const mockFileHandle = {
      createWritable: vi.fn().mockResolvedValue({ write: mockWrite, close: mockClose }),
    }
    const mockPicker = vi.fn().mockResolvedValue(mockFileHandle)

    await exportMarkdown('title', () => 'content', mockPicker)

    expect(mockWriteTextFile).not.toHaveBeenCalled()
  })

  it('writes markdown content to the file handle via showSaveFilePicker', async () => {
    const markdown = '# Test content'
    mockSave.mockResolvedValueOnce(null)
    const mockWrite = vi.fn().mockResolvedValue(undefined)
    const mockClose = vi.fn().mockResolvedValue(undefined)
    const mockCreateWritable = vi.fn().mockResolvedValue({ write: mockWrite, close: mockClose })
    const mockFileHandle = { createWritable: mockCreateWritable }
    const mockPicker = vi.fn().mockResolvedValue(mockFileHandle)

    await exportMarkdown('title', () => markdown, mockPicker)

    expect(mockWrite).toHaveBeenCalledWith(markdown)
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it('uses empty string for markdown content when getter returns empty', async () => {
    mockSave.mockResolvedValueOnce(null)
    const mockWrite = vi.fn().mockResolvedValue(undefined)
    const mockClose = vi.fn().mockResolvedValue(undefined)
    const mockFileHandle = {
      createWritable: vi.fn().mockResolvedValue({ write: mockWrite, close: mockClose }),
    }
    const mockPicker = vi.fn().mockResolvedValue(mockFileHandle)

    await exportMarkdown('title', () => '', mockPicker)

    expect(mockWrite).toHaveBeenCalledWith('')
  })

  it('returns the file handle from showSaveFilePicker', async () => {
    mockSave.mockResolvedValueOnce(null)
    const mockFileHandle = {
      createWritable: vi.fn().mockResolvedValue({
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      }),
    }
    const mockPicker = vi.fn().mockResolvedValue(mockFileHandle)

    const result = await exportMarkdown('title', () => 'md', mockPicker)

    expect(result).toBe(mockFileHandle)
  })
})

describe('openFile – changed error handling (no AbortError special-case)', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    vi.clearAllMocks()
  })

  it('logs AbortError via console.error (no longer silently swallowed)', async () => {
    const abortError = new DOMException('The user aborted a request.', 'AbortError')
    const mockPicker = vi.fn().mockRejectedValue(abortError)
    const setContent = vi.fn()

    await openFile(mockPicker, setContent)

    // Post-PR: AbortError is NOT suppressed; it is logged
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error opening file:', abortError)
    expect(setContent).not.toHaveBeenCalled()
  })

  it('logs any generic error via console.error', async () => {
    const genericError = new Error('Unexpected failure')
    const mockPicker = vi.fn().mockRejectedValue(genericError)
    const setContent = vi.fn()

    await openFile(mockPicker, setContent)

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error opening file:', genericError)
    expect(setContent).not.toHaveBeenCalled()
  })

  it('reads file content and calls setContent on success', async () => {
    const fileText = '# Markdown content'

    // Minimal FileReader shim
    class MockFileReader {
      result: string | null = null
      onload: (() => void) | null = null

      readAsText(_file: unknown) {
        this.result = fileText
        Promise.resolve().then(() => this.onload?.())
      }
    }
    ;(globalThis as any).FileReader = MockFileReader

    const mockFile = {}
    const mockFileHandle = { getFile: vi.fn().mockResolvedValue(mockFile) }
    const mockPicker = vi.fn().mockResolvedValue([mockFileHandle])
    const setContent = vi.fn()

    await openFile(mockPicker, setContent)

    // Give the FileReader microtask a chance to fire
    await new Promise((r) => setTimeout(r, 0))

    expect(setContent).toHaveBeenCalledWith(fileText)
  })

  it('does not call setContent when FileReader result is not a string', async () => {
    class MockFileReader {
      result: ArrayBuffer | null = null
      onload: (() => void) | null = null

      readAsText(_file: unknown) {
        this.result = new ArrayBuffer(8) // non-string
        Promise.resolve().then(() => this.onload?.())
      }
    }
    ;(globalThis as any).FileReader = MockFileReader

    const mockFile = {}
    const mockFileHandle = { getFile: vi.fn().mockResolvedValue(mockFile) }
    const mockPicker = vi.fn().mockResolvedValue([mockFileHandle])
    const setContent = vi.fn()

    await openFile(mockPicker, setContent)
    await new Promise((r) => setTimeout(r, 0))

    expect(setContent).not.toHaveBeenCalled()
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Capability configuration tests (migrated.json)
// ---------------------------------------------------------------------------
describe('Tauri capabilities – migrated.json', () => {
  it('includes dialog:default permission', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const raw = readFileSync(
      resolve(process.cwd(), 'src-tauri/capabilities/migrated.json'),
      'utf-8'
    )
    const config = JSON.parse(raw)
    expect(config.permissions).toContain('dialog:default')
  })

  it('includes fs:default permission', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const raw = readFileSync(
      resolve(process.cwd(), 'src-tauri/capabilities/migrated.json'),
      'utf-8'
    )
    const config = JSON.parse(raw)
    expect(config.permissions).toContain('fs:default')
  })

  it('includes fs:allow-app-write permission', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const raw = readFileSync(
      resolve(process.cwd(), 'src-tauri/capabilities/migrated.json'),
      'utf-8'
    )
    const config = JSON.parse(raw)
    expect(config.permissions).toContain('fs:allow-app-write')
  })

  it('includes fs:allow-app-write-recursive permission', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const raw = readFileSync(
      resolve(process.cwd(), 'src-tauri/capabilities/migrated.json'),
      'utf-8'
    )
    const config = JSON.parse(raw)
    expect(config.permissions).toContain('fs:allow-app-write-recursive')
  })
})

// ---------------------------------------------------------------------------
// Cargo.toml dependency tests
// ---------------------------------------------------------------------------
describe('Cargo.toml – tauri-plugin-dialog dependency', () => {
  it('declares tauri-plugin-dialog as a dependency', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const raw = readFileSync(resolve(process.cwd(), 'src-tauri/Cargo.toml'), 'utf-8')
    expect(raw).toContain('tauri-plugin-dialog')
  })

  it('specifies a version-2 semver range for tauri-plugin-dialog', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const raw = readFileSync(resolve(process.cwd(), 'src-tauri/Cargo.toml'), 'utf-8')
    expect(raw).toMatch(/tauri-plugin-dialog\s*=\s*"2/)
  })
})

// ---------------------------------------------------------------------------
// main.rs plugin registration tests
// ---------------------------------------------------------------------------
describe('main.rs – tauri_plugin_dialog registration', () => {
  it('initialises tauri_plugin_dialog plugin', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const raw = readFileSync(resolve(process.cwd(), 'src-tauri/src/main.rs'), 'utf-8')
    expect(raw).toContain('tauri_plugin_dialog::init()')
  })

  it('registers both fs and dialog plugins in the builder chain', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const raw = readFileSync(resolve(process.cwd(), 'src-tauri/src/main.rs'), 'utf-8')
    expect(raw).toContain('tauri_plugin_fs::init()')
    expect(raw).toContain('tauri_plugin_dialog::init()')
  })
})

// ---------------------------------------------------------------------------
// package.json dependency tests
// ---------------------------------------------------------------------------
describe('package.json – @tauri-apps/plugin-dialog dependency', () => {
  it('lists @tauri-apps/plugin-dialog in dependencies', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const raw = readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')
    const pkg = JSON.parse(raw)
    expect(pkg.dependencies).toHaveProperty('@tauri-apps/plugin-dialog')
  })

  it('uses a 2.x version range for @tauri-apps/plugin-dialog', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const raw = readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')
    const pkg = JSON.parse(raw)
    const version: string = pkg.dependencies['@tauri-apps/plugin-dialog']
    expect(version).toMatch(/^[~^]?2\./)
  })
})