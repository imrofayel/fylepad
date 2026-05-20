import { addCollection } from "@iconify/vue";

import close from "../assets/icons/xfce/close.svg?raw";
import cursor from "../assets/icons/xfce/cursor.svg?raw";

addCollection({
  prefix: "xfce",
  icons: {
    close: { body: close, width: 48, height: 48 },
    cursor: { body: cursor, width: 48, height: 48 },
  },
});
