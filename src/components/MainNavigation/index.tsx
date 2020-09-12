import React from "react";
import AccountsTab from "./AccountsTab";
import MatchesTab from "./MatchesTab";
import ImportTab from "./ImportTab";
import TrendsTab from "./TrendsTab";
import ExportButton from "./ExportButton";
import LogMatchButton from "./LogMatchButton";
import Account from "../../models/Account";
import Season from "../../models/Season";
import { Flex } from "@primer/components";

interface Props {
  activePage: string;
  activeAccount: Account | null;
  activeSeason: Season;
  onPageChange: (activePage: string, val1?: any, val2?: any) => void;
  onExport: () => void;
  openQueue: boolean;
}

const MainNavigation = ({
  activeAccount,
  onPageChange,
  activeSeason,
  activePage,
  onExport,
  openQueue
}: Props) => (
  <Flex ml={3} width="100%" justifyContent="space-between" alignItems="center">
    <Flex>
      <AccountsTab onPageChange={onPageChange} activePage={activePage} />
      {activeAccount && (
        <MatchesTab
          onPageChange={onPageChange}
          activePage={activePage}
          activeSeason={activeSeason}
        />
      )}
      <ImportTab activePage={activePage} />
      {activeAccount && (
        <TrendsTab
          activePage={activePage}
          activeAccount={activeAccount}
          activeSeason={activeSeason}
          onPageChange={onPageChange}
        />
      )}
    </Flex>
    <div>
      <ExportButton onExport={onExport} activePage={activePage} />
      {activeAccount && (
        <LogMatchButton
          activePage={activePage}
          activeSeason={activeSeason}
          onPageChange={onPageChange}
          activeAccount={activeAccount}
          openQueue={openQueue}
        />
      )}
    </div>
    {activePage === "log-match" && (
      <div className="text-gray text-small">
        * All fields optional except match result
      </div>
    )}
  </Flex>
);

export default MainNavigation;
