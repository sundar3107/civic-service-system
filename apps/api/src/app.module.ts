import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AuthoritiesModule } from "./modules/authorities/authorities.module";
import { ComplaintsModule } from "./modules/complaints/complaints.module";
import { IssueCategoriesModule } from "./modules/issue-categories/issue-categories.module";
import { LocationsModule } from "./modules/locations/locations.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { UsersModule } from "./modules/users/users.module";
import { VotesModule } from "./modules/votes/votes.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuditModule,
    AuthModule,
    UsersModule,
    AuthoritiesModule,
    LocationsModule,
    IssueCategoriesModule,
    ComplaintsModule,
    VotesModule,
    ReviewsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
