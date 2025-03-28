# Icon Replacement Instructions

The current icon files (icon16.png, icon48.png, and icon128.png) are placeholder text files. To properly display your extension's icon in Chrome, you need to replace these with actual PNG images.

## Steps to Replace Icons:

1. Use an online SVG to PNG converter such as:
   - https://svgtopng.com
   - https://onlinepngtools.com/convert-svg-to-png
   - https://www.freeconvert.com/svg-to-png

2. Upload the `public/reword-this-logo.svg` file to the converter

3. Create three different sizes of the icon:
   - 16x16 pixels (save as icon16.png)
   - 48x48 pixels (save as icon48.png)
   - 128x128 pixels (save as icon128.png)

4. Replace the placeholder files in this directory with your newly created PNG files

5. Rebuild and reload your extension in Chrome

## Note:
The extension's manifest.json already references these icon files correctly, so once you replace the placeholders with actual images, your extension will display the proper icon in Chrome. 