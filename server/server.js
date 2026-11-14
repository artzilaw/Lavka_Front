'use strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', process.env.PUBLIC_DIR || 'public');
const SRC_DIR = path.join(__dirname, '..', 'src');

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=UTF-8',
    '.hbs': 'text/plain; charset=UTF-8',
};

const server = http.createServer(async (req, res) => {
    try {
        let pathname;
        try {
            pathname = decodeURIComponent(url.parse(req.url).pathname || '');
        } catch {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Bad Request');
            return;
        }

        if (pathname.startsWith('/src/')) {
            const srcFilePath = path.join(__dirname, '..', pathname);
            if (!srcFilePath.startsWith(SRC_DIR)) {
                res.writeHead(403, { 'Content-Type': 'text/plain' });
                res.end('403 Forbidden');
                return;
            }

            try {
                const data = await fs.promises.readFile(srcFilePath);
                const ext = path.extname(srcFilePath);
                const contentType = MIME_TYPES[ext] || 'application/octet-stream';
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
                return;
            } catch (srcError) {
                if (srcError.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
                    res.end('<h1>404 - Файл не найден</h1>');
                    return;
                }
                throw srcError;
            }
        }

        let filePath;
        let fileExists = false;

        if (pathname === '/' || pathname === '/index.html') {
            filePath = path.join(PUBLIC_DIR, 'index.html');
            fileExists = true;
        } else {
            const testPath = path.join(PUBLIC_DIR, pathname);
            try {
                await fs.promises.access(testPath, fs.constants.F_OK);
                const stat = await fs.promises.stat(testPath);
                if (stat.isFile()) {
                    filePath = testPath;
                    fileExists = true;
                }
            } catch {
                fileExists = false;
            }
        }

        if (!fileExists) {
            filePath = path.join(PUBLIC_DIR, 'index.html');
        }

        if (!filePath.startsWith(PUBLIC_DIR)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('403 Forbidden');
            return;
        }

        const data = await fs.promises.readFile(filePath);
        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch {
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    }
});

server.listen(PORT, () => {
    console.log(`Лавка Frontend запущен на http://localhost:${PORT}`);
});
