---
title: '使用freeTexturePacker批量生成图集'
header:
  teaser: /assets/images/teaser-image-3.jpg
toc: true
---

### batchAtlasGenerator.js
```js

const fs = require('fs');
const path = require('path');
const texturePacker = require(path.resolve('/opt/homebrew/lib/node_modules/free-tex-packer-core'));

// 遍历目录并处理每个文件夹
function traverseAndProcessDirectory(dir, outputRoot) {
    const entries = fs.readdirSync(dir, {withFileTypes: true});

    const pngFiles = [];
    entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            traverseAndProcessDirectory(fullPath, outputRoot);
        } else if (entry.isFile()) {
            const ext = path.extname(fullPath).toLowerCase();
            if (ext === '.png' || ext === '.jpg') {
                pngFiles.push({path: fullPath, contents: fs.readFileSync(fullPath)});
            }
        }
    });

    if (pngFiles.length > 0) {
        generateTexturePack(dir, pngFiles, outputRoot);
    }
}

// 生成纹理集
function generateTexturePack(dir, images, outputRoot) {
    // 将输出文件直接放在指定的根目录下
    const outputDir = outputRoot;
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {recursive: true});
    }

    const options = {
        textureName: path.basename(dir), // 使用文件夹名称作为纹理集名称
        width: 2048, // 纹理集的宽度
        height: 2048, // 纹理集的高度
        padding: 1, // 图像之间的填充像素
        allowRotation: true, // 允许图像旋转以优化打包
        detectIdentical: true, // 检测并去除重复图像
        allowTrim: false, // 禁止裁剪图像边缘
        prependFolderName: false, // 禁止在纹理集中添加文件夹名称作为前缀
        packer: "OptimalPacker", // 使用最佳打包算法
        exporter: "Cocos2d" // 输出格式为 Cocos2d
    };

    texturePacker(images, options, (files, error) => {
        if (error) {
            console.error('打包失败', error);
        } else {
            files.forEach(file => {
                const outputFile = path.join(outputDir, file.name); // 将输出文件直接放在根输出目录中
                fs.writeFileSync(outputFile, file.buffer);
                console.log(`生成纹理集: ${outputFile}`);
            });
        }
    });
}

// 主函数
function main() {
    const rootDir = process.env.HOME + "/WebstormProjects/material/xxx/UI"; // 设置需要处理的根目录
    const outputDir = process.env.HOME + "/Desktop/output"; // 设置自定义的输出根目录
    traverseAndProcessDirectory(rootDir, outputDir);
}

main();


```