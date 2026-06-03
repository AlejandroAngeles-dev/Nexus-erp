import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global() //Permite mantener el modulo en memoria y compartirlo con otros modulos sin necesidad de importarlo
@Module({
    providers: [PrismaService],
    exports: [PrismaService] //Permite exportar el servicio para que pueda ser utilizado en otros modulos
})
export class PrismaModule {}    