import React from "react";
import MatchesList from "./MatchesList";
import Account from "../models/Account";
import Season from "../models/Season";
import LayoutChildrenContainer from "./LayoutChildrenContainer";

interface Props {
  account: Account;
  openQueue: boolean;
  season: Season;
  onPageChange: (activePage: string, val1?: any, val2?: any) => void;
  scrollToMatchID: string | null;
  theme: string;
}

const MatchesPage = ({
  account,
  onPageChange,
  season,
  scrollToMatchID,
  openQueue,
  theme
}: Props) => (
  <LayoutChildrenContainer>
    <MatchesList
      season={season}
      account={account}
      theme={theme}
      openQueue={openQueue}
      onPageChange={onPageChange}
      scrollToMatchID={scrollToMatchID}
    />
  </LayoutChildrenContainer>
);

export default MatchesPage;
