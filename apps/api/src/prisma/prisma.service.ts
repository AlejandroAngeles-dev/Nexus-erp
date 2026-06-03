import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

@Injectable()
export class PrismaService
extends PrismaClient
implements OnModuleInit, OnModuleDestroy
{

    constructor() {
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL,
        });
        super({ adapter });
    }
    //Se ejecuta de manera automatica cuando nestjs inicia el modulo
    async onModuleInit() {
        await this.$connect();
        console.log("La conexión a la base de datos se ha establecido correctamente.");
    }


    //Se ejecuta de manera automatica cuando nestjs destruye el modulo
    async onModuleDestroy(){
        await this.$disconnect();
        console.log("La conexión a la base de datos se ha cerrado correctamente.");
    }

}