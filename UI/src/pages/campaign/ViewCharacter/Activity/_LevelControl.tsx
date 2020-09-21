import * as React from "react";
import { Dropdown } from "react-bootstrap";

import { Encounter } from "../../../../types";

interface Props {
  activeEncounter: Encounter,
  encounters: Encounter[],
  onChange?: (encounter: Encounter) => void
}

export const LevelControl: React.FC<Props> = ({ activeEncounter, encounters, onChange }) => {
  return (
    <Dropdown>
      <Dropdown.Toggle id="encounter-selector">Encounter {activeEncounter.level}</Dropdown.Toggle>
      <Dropdown.Menu>
        {encounters.map((encounter, i, arr) => {
          const renderDivider = i + 1 < arr.length && arr[i + 1].tier !== encounter.tier;
          const selectLevel = () => { 
            if(!onChange) return;
            onChange(encounter);
          };
          return (
            <React.Fragment key={`encounter-${encounter.level}`}>
              <Dropdown.Item onSelect={selectLevel}>Encounter {encounter.level}</Dropdown.Item>
              { renderDivider && (<Dropdown.Divider />) }
            </React.Fragment>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
};
