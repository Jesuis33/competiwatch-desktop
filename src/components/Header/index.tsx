import React from "react";
import SeasonSelect from "../SeasonSelect";
import Account from "../../models/Account";
import Season from "../../models/Season";
import StickyBar from "./StickyBar";
import { Flex, Heading } from "@primer/components";
import AccountsTab from "../Header/AccountsTab";
import MatchesTab from "./MatchesTab";
import OpenQueueSelect from "../OpenQueueSelect";
import ImportTab from "./ImportTab";
import TrendsTab from "./TrendsTab";
import ExportButton from "./ExportButton";
import LogMatchButton from "./LogMatchButton";


interface Props {
  activeSeason: Season;
  seasons: Season[];
  onSeasonChange: (newNumber: Season) => void;
  accounts: Array<Account>;
  onPageChange: (activePage: string, val1?: any, val2?: any) => void;
  activeAccount: Account | null;
  activePage: string;
  onExport: () => void;
  openQueue: boolean;
  onOpenQueueChange: (newValue: boolean) => void;
}

const queueTypeSelectionIsSupported = (activeSeason: number) => {
  return !Season.onlyOpenQueue(activeSeason) && !Season.onlyRoleQueue(activeSeason);
};

const Header = ({
  activeSeason,
  onSeasonChange,
  accounts,
  seasons,
  onPageChange,
  activeAccount,
  activePage,
  onExport,
  openQueue,
  onOpenQueueChange
}: Props) => (
  <StickyBar>
    <div className="d-flex flex-items-center container">
      {accounts && accounts.length > 0 && (
        <SeasonSelect
          activeSeason={activeSeason}
          onSeasonChange={onSeasonChange}
          seasons={seasons}
        />
      )}
      <Flex ml={3} width="100%" justifyContent="space-between" alignItems="center">
        <Flex>
          {activeAccount && (
            <Heading py={3} mr={3} px={2} fontSize={1}>{activeAccount.battletag}</Heading>
          )}
          <AccountsTab onPageChange={onPageChange} activePage={activePage} />
          {activeAccount && (
            <Flex alignItems="center">
              <MatchesTab
                onPageChange={onPageChange}
                activePage={activePage}
                activeSeason={activeSeason}
              />
              {["matches", "trends", "log-match"].includes(activePage) && (
                <>
                  {queueTypeSelectionIsSupported(activeSeason.number) ? (
                    <OpenQueueSelect
                      openQueue={openQueue}
                      onOpenQueueChange={onOpenQueueChange}
                    />
                  ) : (
                      <>{Season.onlyRoleQueue(activeSeason.number) ? 'Role queue' : 'Open queue'}</>
                    )}
                </>
              )}
            </Flex>
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
    </div>
  </StickyBar>
);

export default Header;
