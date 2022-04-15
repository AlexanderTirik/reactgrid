import { ReactGridProps } from '../Model/PublicModel';
import { State } from '../Model/State';
import { getSelectedLocations } from './getSelectedLocations';

export function handleStateUpdate<TState extends State = State>(newState: TState, state: TState, props: ReactGridProps, setState: (state: TState) => void): void {
    const changes = [...newState.queuedCellChanges];
    if (changes.length > 0) {
        if (props.onCellsChanged) {
            props.onCellsChanged([...changes]);
        }
        changes.forEach(() => newState.queuedCellChanges.pop());
    }
    const selects = getSelectedLocations(newState);
    if (changes.length > 0 && props.onCellsSelected) {
        props.onCellsSelected([...selects]);
    }
    if (newState !== state) {
        setState(newState);
    }
}
