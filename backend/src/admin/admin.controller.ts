import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Req,
    UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminService } from "./admin.service";

@UseGuards(JwtAuthGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("status")
  getStatus() {
    return this.adminService.getStatus();
  }

  @Get("members")
  async getAllMembers() {
    return this.adminService.getMembers();
  }

  @Put("members/:id")
  async updateMember(
    @Param("id") memberId: string,
    @Body() updateData: Record<string, any>,
  ) {
    return this.adminService.updateMember(memberId, updateData);
  }

  @Put("members/:id/toggle-admin")
  async toggleAdmin(@Param("id") memberId: string, @Req() req: any) {
    return this.adminService.toggleAdmin(memberId, req.user);
  }

  @Put("members/:id/membership-status")
  async setMembershipStatus(
    @Param("id") memberId: string,
    @Body() body: { status: "PENDING" | "APPROVED" },
    @Req() req: any,
  ) {
    return this.adminService.setMembershipStatus(
      memberId,
      body.status,
      req.user,
    );
  }

  @Delete("members/:id")
  async deleteMember(@Param("id") memberId: string) {
    return this.adminService.deleteMember(memberId);
  }

  @Get("training-registrations")
  async getTrainingRegistrations() {
    return this.adminService.getTrainingRegistrations();
  }

  @Get("payments-overview")
  async getPaymentsOverview() {
    return this.adminService.getPaymentsOverview();
  }

  @Get("dashboard-stats")
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Post("test/create-training-registrations")
  async createTestTrainingRegistrations() {
    return this.adminService.createTestTrainingRegistrations();
  }
}
