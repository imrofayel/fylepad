// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const { isSignedIn } = useAuth()
  
  // Define protected routes
  const protectedRoutes = ['/app']
  
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route))
  
  // If user is not signed in and trying to access protected route
  if (!isSignedIn.value && isProtectedRoute) {
    return navigateTo('/sign-in')
  }
  
  // If user is signed in and trying to access sign-in page, redirect to notes
  if (isSignedIn.value && to.path === '/sign-in') {
    return navigateTo('/app')
  }
})
