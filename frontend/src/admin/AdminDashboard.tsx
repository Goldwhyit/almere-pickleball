import { Tab } from "@headlessui/react";
import {
    CalendarIcon,
    ChartBarIcon,
    CreditCardIcon,
    HandRaisedIcon,
    UsersIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import DashboardOverview from "./DashboardOverview";
import MembersTable from "./MembersTable";
import PaymentsOverview from "./PaymentsOverview";
import PlaydaysList from "./PlaydaysList";
import SponsorsManagement from "./SponsorsManagement";

const tabs = [
  { name: "Overzicht", icon: ChartBarIcon },
  { name: "Leden", icon: UsersIcon },
  { name: "Speeldagen", icon: CalendarIcon },
  { name: "Betalingen", icon: CreditCardIcon },
  { name: "Sponsors", icon: HandRaisedIcon },
];

export const AdminDashboard: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="min-h-screen bg-ap-light">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto py-8 px-4">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex space-x-4 border-b mb-8">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `flex items-center gap-2 px-4 py-2 text-lg font-medium border-b-2 transition focus:outline-none ${
                    selected
                      ? "border-blue-600 text-blue-700 bg-white"
                      : "border-transparent text-gray-500 hover:text-blue-600"
                  }`
                }
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <DashboardOverview onSelectTab={setSelectedIndex} />
            </Tab.Panel>
            <Tab.Panel>
              <MembersTable />
            </Tab.Panel>
            <Tab.Panel>
              <PlaydaysList />
            </Tab.Panel>
            <Tab.Panel>
              <PaymentsOverview />
            </Tab.Panel>
            <Tab.Panel>
              <SponsorsManagement />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};
