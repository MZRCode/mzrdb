interface QuickDB {
    target?: string | null;
    table?: string;
}

declare const mzrdb: {
    setLanguage: (language: 'tr' | 'en') => string;
    setReadable: (readable: boolean) => boolean;
    setNoBlankData: (noBlankData: boolean) => boolean;
    setAdapter: (adapter: 'jsondb' | 'bsondb' | 'yamldb') => true;
    setFolder: (adapter: string) => true;
    setFile: (adapter: string) => true;
    version: string;
    size: string;

    length: (type: 'all' | 'object') => number;
    set: (key: string, value: any) => any;
    delete: (key: string) => boolean;
    del: (key: string) => boolean;
    fetch: (key: string) => any;
    has: (key: string) => boolean;
    type: (key: string) => string;
    get: (key: string) => any;
    push: (key: string, value: any) => any[];
    unpush: (key: string, value: any) => any[];
    add: (key: string, value: number) => number;
    subtract: (key: string, value: number) => number;
    sub: (key: string, value: number) => number;
    setByPriority: (key: string, value: any) => any;
    delByPriority: (key: string, value: any) => any;
    all: (key?: 'all' | 'object' | 'keys' | 'values') => { [key: string]: any };
    getAll: () => { [key: string]: any };
    fetchAll: () => { [key: string]: any };
    deleteAll: () => true;
    clear: () => true;
    backup: (file: string) => true;
    move: (QuickDB: QuickDB) => true;
    startsWith: (key: string) => string[];
    includes: (key: string) => string[];
    endsWith: (key: string) => string[];
    destroy: () => true;
}

export = mzrdb;