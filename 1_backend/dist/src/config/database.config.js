"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
exports.DatabaseModule = mongoose_1.MongooseModule.forRootAsync({
    inject: [config_1.ConfigService],
    useFactory: (configService) => {
        const uri = configService.get('MONGODB_URI');
        if (!uri) {
            throw new Error('MONGODB_URI environment variable is required');
        }
        return {
            uri,
        };
    },
});
//# sourceMappingURL=database.config.js.map