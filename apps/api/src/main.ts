import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { MainModule } from "./main-module";

const port = parseInt(process.env.PORT ?? "3000", 10);

async function bootstrap() {
  const logger = new Logger("main");

  const app = await NestFactory.create(MainModule);
  app.setGlobalPrefix("/api");
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("Jira Flow Metrics")
    .setDescription("API for Jira Flow Metrics")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  logger.log(`Running server on PID=${process.pid}, http://localhost:${port}`);
  await app.listen(port);
}
bootstrap();
