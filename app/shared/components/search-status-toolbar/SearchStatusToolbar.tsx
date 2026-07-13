
import { ControlPanel } from '../control-panel';
import { Search, SearchProps } from '../search/Search';
import { FilterSelect, FilterSelectProps } from '../selector/FilterSelect';

interface SearchStatusToolbarProps {
    dataTestId: string
    searchProps: SearchProps
    statusFilterProps: FilterSelectProps
}

export const SearchStatusToolbar = ({ dataTestId, searchProps, statusFilterProps }: Readonly<SearchStatusToolbarProps>) => {
  return (
    <ControlPanel
      dataTestId={dataTestId}
      leftContent={
        <>
          <Search {...searchProps} />
        </>
      }
      rightContent={(
        <FilterSelect
          {...statusFilterProps}
        />
      )}
    />
  );
};