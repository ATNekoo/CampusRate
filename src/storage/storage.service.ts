import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface Database {
    places: unknown[];
    reviews: unknown[];
}

@Injectable()
export class StorageService implements OnModuleInit {
    private readonly dataFilePath: string;

    constructor() {
        this.dataFilePath = process.env.DATA_FILE_PATH!;
    }

    async onModuleInit(): Promise<void> {
        try {
            await access(this.dataFilePath);
        } catch {
            await mkdir(dirname(this.dataFilePath), { recursive: true });
            const baseData: Database = { places: [], reviews: [] };
            await writeFile(this.dataFilePath, JSON.stringify(baseData, null, 2), "utf-8");
        }
    }
    async readJSONFile(): Promise<Database> {
        try {
            const rawData = (await readFile(this.dataFilePath, "utf-8"));
            return JSON.parse(rawData) as Database;
        } catch (error) {
            if (error instanceof SyntaxError) {
                console.error("File is corrupted and cannot be parsed:", error);
                throw new InternalServerErrorException("Data is corrupted in the file, cannot read it ");
            }
            throw error;
        }
    }
    async writeJSONFile(data: Database): Promise<void> {
        await writeFile(this.dataFilePath, JSON.stringify(data, null, 2), "utf-8");
    }
}