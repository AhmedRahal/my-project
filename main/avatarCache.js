const fs = require("fs");
const path = require("path");
const { app, ipcMain } = require("electron");

function getAvatarCacheDir() {
    const dir = path.join(app.getPath("userData"), "nurov", "avatar_cache");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
}

ipcMain.handle("image:cache-avatar", (event, { userId, base64, ext }) => {
    const dir = getAvatarCacheDir();
    const filePath = path.join(dir, `${userId}.${ext || "png"}`);
    const data = base64.split(",")[1]; // strip the "data:image/png;base64," prefix
    fs.writeFileSync(filePath, Buffer.from(data, "base64"));
    return { path: filePath };
});

ipcMain.handle("image:get-cached-avatar", (event, userId) => {
    const dir = getAvatarCacheDir();
    const found = fs.readdirSync(dir).find((f) => f.startsWith(`${userId}.`));
    return found ? `file://${path.join(dir, found)}` : null;
});