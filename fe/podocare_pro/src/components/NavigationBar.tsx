import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";

export interface NavigationBarProps {
  onKeywordChange?: (keyword: string) => void;
  resetTriggered?: boolean;
  className?: string;
  children?: React.ReactNode;
  showSearchbar?: boolean;
  replaceSearchbar?: boolean;
}

const NavigationBar = ({
  onKeywordChange,
  resetTriggered,
  className = "",
  children,
  showSearchbar = true,
  replaceSearchbar = false,
}: NavigationBarProps) => {
  return (
    <div
      className={`navigation-bar ${className} height-fit-content block justify-center relative width-93`}
    >
      <section
        className={`navigation-bar-interior flex align-items-center ${
          showSearchbar || replaceSearchbar ? "space-between" : "justify-end"
        } width-93 height-fit-content m-0-auto ${className}`}
      >
        {showSearchbar && onKeywordChange != undefined && resetTriggered != undefined && (
          <SearchBar
            onKeywordChange={onKeywordChange}
            resetTriggered={resetTriggered}
          />
        )}
        {children}
        <UserMenu />
      </section>
    </div>
  );
};

export default NavigationBar;
