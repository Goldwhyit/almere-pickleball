import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { AccountType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async createAdminUser() {
    const email = "admin@almere-pickleball.nl";
    const password = "Almere2026!";
    const firstName = "Admin";
    const lastName = "User";

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { message: "Admin user already exists", email };
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hash,
        member: {
          create: {
            firstName,
            lastName,
            accountType: "ADMIN",
          },
        },
      },
      include: { member: true },
    });

    return {
      message: "Admin user created successfully",
      email,
      password,
      note: "Please change the password after first login",
    };
  }

  ensureAdmin(user: any) {
    if (!user?.member || user.member.accountType !== "ADMIN") {
      throw new ForbiddenException("Admin only");
    }
  }

  mapMember(member: any): any {
    const APPROVED_ACCOUNT_TYPES = ["MEMBER", "ADMIN"];
    const isApproved = APPROVED_ACCOUNT_TYPES.includes(member.accountType);
    const paymentStatus = member.paymentStatus === "PAID" ? "PAID" : "UNPAID";
    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.user?.email,
      phone: member.phone,
      street: member.street,
      houseNumber: member.houseNumber,
      postalCode: member.postalCode,
      city: member.city,
      membershipType: member.membershipType,
      membershipStatus: isApproved ? "APPROVED" : "PENDING",
      paymentStatus,
      role: member.accountType === "ADMIN" ? "ADMIN" : "MEMBER",
    };
  }

  async getMembers() {
    const members = await this.prisma.member.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return members.map((member) => this.mapMember(member));
  }

  async updateMember(memberId: string, data: any) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) throw new NotFoundException("Member not found");

    const updated = await this.prisma.$transaction(async (tx) => {
      if (data.email && data.email !== member.user?.email) {
        await tx.user.update({
          where: { id: member.userId },
          data: { email: data.email },
        });
      }

      return tx.member.update({
        where: { id: memberId },
        data: {
          firstName: data.firstName ?? member.firstName,
          lastName: data.lastName ?? member.lastName,
          phone: data.phone ?? member.phone,
          street: data.street ?? member.street,
          houseNumber: data.houseNumber ?? member.houseNumber,
          postalCode: data.postalCode ?? member.postalCode,
          city: data.city ?? member.city,
          membershipType: data.membershipType ?? member.membershipType,
          paymentStatus: data.paymentStatus ?? member.paymentStatus,
          credit: data.credit ?? member.credit,
          punchCardCount: data.punchCardCount ?? member.punchCardCount,
          membershipStartDate:
            data.membershipStartDate ?? member.membershipStartDate,
          membershipExpiryDate:
            data.membershipExpiryDate ?? member.membershipExpiryDate,
        },
        include: { user: true },
      });
    });

    return this.mapMember(updated);
  }

  async setMembershipStatus(
    memberId: string,
    status: "PENDING" | "APPROVED",
    currentUser: any,
  ) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) throw new NotFoundException("Member not found");

    if (
      currentUser?.member?.id === memberId &&
      (member.accountType as any) === "ADMIN" &&
      status !== "APPROVED"
    ) {
      throw new ForbiddenException("Cannot downgrade own admin status");
    }

    const nextAccountType: AccountType =
      status === "APPROVED" ? (AccountType.MEMBER as any) : ("PENDING" as any);

    const updated = await this.prisma.member.update({
      where: { id: memberId },
      data: {
        accountType: nextAccountType,
        ...(status === "APPROVED"
          ? { conversionDate: new Date(), membershipStartDate: new Date() }
          : {}),
      },
      include: { user: true },
    });

    return this.mapMember(updated);
  }

  async approveMembership(memberId: string) {
    const member = await this.prisma.member.update({
      where: { id: memberId },
      data: {
        accountType: "MEMBER",
        conversionDate: new Date(),
        membershipStartDate: new Date(),
      },
      include: { user: true },
    });

    return this.mapMember(member);
  }

  async toggleAdmin(memberId: string, currentUser: any) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) throw new NotFoundException("Member not found");

    if (
      currentUser?.member?.id === memberId &&
      (member.accountType as any) === "ADMIN"
    ) {
      throw new ForbiddenException("Cannot downgrade own admin role");
    }

    const nextAccountType: AccountType =
      (member.accountType as any) === "ADMIN"
        ? (AccountType.MEMBER as any)
        : (AccountType.ADMIN as any);

    const updated = await this.prisma.member.update({
      where: { id: memberId },
      data: { accountType: nextAccountType },
      include: { user: true },
    });

    return this.mapMember(updated);
  }

  async markPaid(memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) throw new NotFoundException("Member not found");

    const nextPaymentDue =
      member.membershipType === "MONTHLY"
        ? new Date(new Date().setMonth(new Date().getMonth() + 1))
        : null;

    const updated = await this.prisma.member.update({
      where: { id: memberId },
      data: {
        paymentStatus: "PAID",
        lastPaymentDate: new Date(),
        nextPaymentDue,
      },
      include: { user: true },
    });

    return this.mapMember(updated);
  }

  async deleteMember(memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) throw new NotFoundException("Member not found");

    await this.prisma.user.delete({
      where: { id: member.userId },
    });

    return { success: true };
  }

  async getDashboardOverview(adminMemberId: string) {
    const totalMembers = await this.prisma.member.count();
    const pendingMembers = await this.prisma.member.count({
      where: {
        OR: [
          { accountType: "TRIAL" },
          { accountType: "TRIAL_EXPIRED" },
          { membershipType: null },
        ],
      },
    });
    const openPayments = await this.prisma.member.count({
      where: {
        accountType: { in: ["MEMBER", "ADMIN"] },
        paymentStatus: { not: "PAID" },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const registrations = await this.prisma.trainingRegistration.findMany({
      where: { trainingDate: { gte: today } },
      include: { member: { include: { user: true } } },
      orderBy: [{ trainingDate: "asc" }, { trainingTime: "asc" }],
    });

    const playDayMap = new Map<string, any>();

    registrations.forEach((registration) => {
      const member = registration.member;
      // Fix type error: cast accountType naar any zodat includes werkt
      const APPROVED_ACCOUNT_TYPES = ["MEMBER", "ADMIN"];
      const isApproved =
        APPROVED_ACCOUNT_TYPES.includes(member.accountType as any) &&
        member.paymentStatus === "PAID";

      if (!isApproved) return;

      const dateKey = registration.trainingDate.toISOString().split("T")[0];
      const key = `${dateKey}|${registration.trainingTime}|${registration.location}`;
      const existing = playDayMap.get(key);

      const player = {
        memberId: member.id,
        name: `${member.firstName} ${member.lastName}`,
        membershipType: member.membershipType,
      };

      if (existing) {
        existing.registrations.push(player);
      } else {
        playDayMap.set(key, {
          id: key,
          date: dateKey,
          time: registration.trainingTime,
          location: registration.location,
          registrations: [player],
        });
      }
    });

    const playDays = Array.from(playDayMap.values()).slice(0, 4);

    const myRegistrations = await this.prisma.trainingRegistration.findMany({
      where: { memberId: adminMemberId, trainingDate: { gte: today } },
      orderBy: [{ trainingDate: "asc" }, { trainingTime: "asc" }],
      take: 4,
    });

    return {
      totalMembers,
      pendingMembers,
      openPayments,
      playDays,
      myRegistrations: myRegistrations.map((registration) => ({
        id: registration.id,
        date: registration.trainingDate.toISOString().split("T")[0],
        time: registration.trainingTime,
        location: registration.location,
      })),
    };
  }

  async getTrainingRegistrations() {
    // Get now
    const now = new Date();

    // Include lessons from the past 30 days + next 90 days to show history and future
    const startDate = new Date(now);
    startDate.setUTCDate(startDate.getUTCDate() - 30);
    startDate.setUTCHours(0, 0, 0, 0);

    // End 90 days from today
    const endDate = new Date(now);
    endDate.setUTCDate(endDate.getUTCDate() + 90);
    endDate.setUTCHours(23, 59, 59, 999);

    // Haal BEIDE TrainingRegistration EN TrialLesson records op
    const [registrations, trialLessons] = await Promise.all([
      this.prisma.trainingRegistration.findMany({
        where: {
          trainingDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          member: {
            include: { user: true },
          },
        },
        orderBy: [{ trainingDate: "asc" }, { trainingTime: "asc" }],
      }),
      this.prisma.trialLesson.findMany({
        where: {
          scheduledDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          member: {
            include: { user: true },
          },
        },
        orderBy: [{ scheduledDate: "asc" }, { scheduledTime: "asc" }],
      }),
    ]);

    // Group by date, time, location
    const groupedMap = new Map<string, any>();

    // Process TrainingRegistration records
    registrations.forEach((reg) => {
      const dateStr = reg.trainingDate.toISOString().split("T")[0];
      const key = `${dateStr}|${reg.trainingTime}|${reg.location}`;
      const member = reg.member;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          date: dateStr,
          time: reg.trainingTime,
          location: reg.location,
          totalRegistrations: 0,
          capacityLeft: 16,
          byMembershipType: {
            YEARLY_UPFRONT: [],
            YEARLY: [],
            MONTHLY: [],
            PER_SESSION: [],
            PUNCH_CARD: [],
            TRIAL: [],
            UNKNOWN: [],
          },
          byPaymentStatus: {
            PAID: 0,
            UNPAID: 0,
          },
        });
      }

      const group = groupedMap.get(key);
      const membershipType = member.membershipType || "UNKNOWN";
      const paymentStatus = member.paymentStatus === "PAID" ? "PAID" : "UNPAID";

      group.totalRegistrations += 1;
      group.capacityLeft = Math.max(0, 16 - group.totalRegistrations);
      group.byPaymentStatus[paymentStatus] += 1;

      // Always add member, ensuring we handle all membership types
      const memberData = {
        memberId: member.id,
        name: `${member.firstName} ${member.lastName}`,
        email: member.user?.email,
        phone: member.phone,
        paymentStatus,
        bookingType: "REGISTRATION",
      };

      // Check if this is a trial/proef member (by name or null membershipType)
      let finalMembershipType = membershipType;
      if (
        membershipType === "UNKNOWN" &&
        (member.firstName.toLowerCase().includes("proef") ||
          member.firstName.toLowerCase().includes("trial"))
      ) {
        finalMembershipType = "TRIAL";
      }

      if (group.byMembershipType[finalMembershipType]) {
        group.byMembershipType[finalMembershipType].push(memberData);
      } else {
        // Dynamically create entry for unknown types
        group.byMembershipType[finalMembershipType] = [memberData];
      }
    });

    // Process TrialLesson records (PUNCH_CARD members)
    trialLessons.forEach((lesson) => {
      const dateStr = lesson.scheduledDate.toISOString().split("T")[0];
      const key = `${dateStr}|${lesson.scheduledTime}|${lesson.location}`;
      const member = lesson.member;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          date: dateStr,
          time: lesson.scheduledTime,
          location: lesson.location,
          totalRegistrations: 0,
          capacityLeft: 16,
          byMembershipType: {
            YEARLY_UPFRONT: [],
            YEARLY: [],
            MONTHLY: [],
            PER_SESSION: [],
            PUNCH_CARD: [],
            TRIAL: [],
            UNKNOWN: [],
          },
          byPaymentStatus: {
            PAID: 0,
            UNPAID: 0,
          },
        });
      }

      const group = groupedMap.get(key);
      const paymentStatus = member.paymentStatus === "PAID" ? "PAID" : "UNPAID";

      group.totalRegistrations += 1;
      group.capacityLeft = Math.max(0, 16 - group.totalRegistrations);
      group.byPaymentStatus[paymentStatus] += 1;

      // Always add member as TRIAL (proefles)
      const memberData = {
        memberId: member.id,
        name: `${member.firstName} ${member.lastName}`,
        email: member.user?.email,
        phone: member.phone,
        paymentStatus,
        bookingType: "TRIAL_LESSON",
      };

      // Use TRIAL label for all trial lessons
      group.byMembershipType["TRIAL"].push(memberData);
    });

    const result = Array.from(groupedMap.values());
    const totalBookings = registrations.length + trialLessons.length;
    return { registrations: result, total: totalBookings };
  }

  async getPaymentsOverview() {
    const members = await this.prisma.member.findMany({
      where: {
        accountType: { in: ["MEMBER", "ADMIN"] },
        membershipType: { not: null },
      },
      include: { user: true },
      orderBy: { lastName: "asc" },
    });

    type MemberData = {
      memberId: string;
      name: string;
      email?: string;
      phone?: string | null;
      paymentStatus: string;
      lastPaymentDate?: Date | null;
      nextPaymentDue?: Date | null;
      credit: number;
      punchCardCount: number;
    };

    const overview: {
      totalMembers: number;
      totalPaid: number;
      totalUnpaid: number;
      byMembershipType: {
        YEARLY_UPFRONT: { paid: MemberData[]; unpaid: MemberData[] };
        YEARLY: { paid: MemberData[]; unpaid: MemberData[] };
        MONTHLY: { paid: MemberData[]; unpaid: MemberData[] };
        PER_SESSION: { paid: MemberData[]; unpaid: MemberData[] };
        PUNCH_CARD: { paid: MemberData[]; unpaid: MemberData[] };
      };
    } = {
      totalMembers: members.length,
      totalPaid: 0,
      totalUnpaid: 0,
      byMembershipType: {
        YEARLY_UPFRONT: { paid: [], unpaid: [] },
        YEARLY: { paid: [], unpaid: [] },
        MONTHLY: { paid: [], unpaid: [] },
        PER_SESSION: { paid: [], unpaid: [] },
        PUNCH_CARD: { paid: [], unpaid: [] },
      },
    };

    members.forEach((member) => {
      const isPaid = member.paymentStatus === "PAID";
      const membershipType = member.membershipType || "UNKNOWN";

      if (isPaid) {
        overview.totalPaid += 1;
      } else {
        overview.totalUnpaid += 1;
      }

      const memberData = {
        memberId: member.id,
        name: `${member.firstName} ${member.lastName}`,
        email: member.user?.email,
        phone: member.phone,
        paymentStatus: member.paymentStatus,
        lastPaymentDate: member.lastPaymentDate,
        nextPaymentDue: member.nextPaymentDue,
        credit: member.credit,
        punchCardCount: member.punchCardCount,
      };

      // Only add to overview if it's a valid membership type
      const validTypes = [
        "YEARLY_UPFRONT",
        "YEARLY",
        "MONTHLY",
        "PER_SESSION",
        "PUNCH_CARD",
      ];
      if (validTypes.includes(membershipType)) {
        const type = membershipType as keyof typeof overview.byMembershipType;
        if (isPaid) {
          overview.byMembershipType[type].paid.push(memberData);
        } else {
          overview.byMembershipType[type].unpaid.push(memberData);
        }
      }
    });

    return overview;
  }

  async createTestTrainingRegistrations() {
    // Haal alle members op met membershipType
    const members = await this.prisma.member.findMany({
      where: {
        membershipType: {
          in: [
            "YEARLY_UPFRONT",
            "YEARLY",
            "MONTHLY",
            "PER_SESSION",
            "PUNCH_CARD",
          ],
        },
      },
      take: 5,
    });

    if (members.length === 0) {
      return { success: false, message: "No members found" };
    }

    // Maak test training registrations voor komende 90 dagen
    const registrations = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const trainingTime = "19:00";
    const location = "Sporthal Almere, Bataviaplein 60";

    // Maak 3 maanden aan trainingsdagen (voorbeelden)
    for (let day = 0; day < 90; day += 7) {
      // Elke week één trainingsdag
      const trainingDate = new Date(today);
      trainingDate.setDate(trainingDate.getDate() + day);

      // Voeg random members toe aan deze trainingsdag
      const shuffledMembers = [...members].sort(() => Math.random() - 0.5);
      const data = shuffledMembers
        .slice(0, Math.ceil(members.length * 0.6))
        .map((member) => ({
          memberId: member.id,
          trainingDate,
          trainingTime,
          location,
        }));

      if (data.length > 0) {
        const result = await this.prisma.trainingRegistration.createMany({
          data,
          skipDuplicates: true,
        });

        registrations.push(result);
      }
    }

    return {
      success: true,
      message: `Created ${registrations.reduce((sum, item) => sum + item.count, 0)} test training registrations`,
    };
  }

  getStatus() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }

  async getDashboardStats() {
    // Get all members
    const allMembers = await this.prisma.member.findMany({
      include: { user: true },
    });

    // Count members by account type (cast for type safety)
    const totalMembers = allMembers.filter((m) =>
      ["MEMBER" as any, "ADMIN" as any].includes(m.accountType),
    ).length;

    const pendingMembers = allMembers.filter(
      (m) => (m.accountType as any) === "PENDING",
    ).length;

    // Count payment statuses for members with subscriptions
    const memberWithSubs = allMembers.filter(
      (m) =>
        ["MEMBER" as any, "ADMIN" as any].includes(m.accountType) &&
        m.membershipType,
    );

    const paidMembers = memberWithSubs.filter(
      (m) => m.paymentStatus === "PAID",
    ).length;

    const unpaidMembers = memberWithSubs.filter(
      (m) => m.paymentStatus === "UNPAID" || m.paymentStatus === "PENDING",
    ).length;

    const totalTrialMembers = allMembers.filter((m) =>
      ["TRIAL" as any, "TRIAL_EXPIRED" as any].includes(m.accountType),
    ).length;

    const convertedToMember = allMembers.filter(
      (m) => (m.accountType as any) === "MEMBER" && m.createdAt,
    ).length;

    return {
      totalMembers,
      pendingMembers,
      openPayments: unpaidMembers,
      totalTrialMembers,
      convertedToMember,
      paymentDetails: {
        totalWithSubscription: memberWithSubs.length,
        paid: paidMembers,
        unpaid: unpaidMembers,
      },
    };
  }
}
