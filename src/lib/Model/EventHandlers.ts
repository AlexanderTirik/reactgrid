import { StateUpdater, PointerEvent, ClipboardEvent, KeyboardEvent, StateModifier } from '.';
import { recalcVisibleRange, getScrollableParent } from '../Functions';
import { getScrollOfScrollableElement } from '../Functions/scrollHelpers';
import { getVisibleSizeOfReactGrid } from '../Functions/elementSizeHelpers';
import { AbstractPointerEventsController } from './AbstractPointerEventsController';

export class EventHandlers {

    constructor(public updateState: StateUpdater, public pointerEventsController: AbstractPointerEventsController) { }

    pointerDownHandler = (event: PointerEvent) => this.updateState(state => this.pointerEventsController.handlePointerDown(event, state));
    keyDownHandler = (event: KeyboardEvent) => this.updateState(state => state.currentBehavior.handleKeyDown(event, state));
    keyUpHandler = (event: KeyboardEvent) => this.updateState(state => state.currentBehavior.handleKeyUp(event, state));
    copyHandler = (event: ClipboardEvent) => this.updateState(state => state.currentBehavior.handleCopy(event, state));
    pasteHandler = (event: ClipboardEvent) => this.updateState(state => state.currentBehavior.handlePaste(event, state));
    cutHandler = (event: ClipboardEvent) => this.updateState(state => state.currentBehavior.handleCut(event, state));
    windowResizeHandler = () => this.updateState(recalcVisibleRange);
    reactgridRefHandler = (reactGridElement: HTMLDivElement) => {
        this.assignScrollHandlerToReactGridElement(reactGridElement, recalcVisibleRange);
    };
    hiddenElementRefHandler = (hiddenFocusElement: HTMLInputElement) => this.updateState(state => { state.hiddenFocusElement = hiddenFocusElement; return state });

    pasteCaptureHandler = (event: ClipboardEvent) => {
        const htmlData = event.clipboardData!.getData('text/html');
        const parsedData = new DOMParser().parseFromString(htmlData, 'text/html');
        if (htmlData && parsedData.body.firstElementChild!.getAttribute('data-reactgrid') === 'reactgrid-content') {
            event.bubbles = false;
        }
    };

    scrollHandler = (visibleRangeCalculator: StateModifier) => this.updateOnScrollChange(visibleRangeCalculator);

    protected assignScrollHandlerToReactGridElement = (reactGridElement: HTMLDivElement, visibleRangeCalculator: StateModifier) => {
        if (reactGridElement) {
            this.updateState(state => {
                const scrollableElement = getScrollableParent(reactGridElement, true);
                scrollableElement!.addEventListener('scroll', () => this.scrollHandler(visibleRangeCalculator));
                return visibleRangeCalculator({ ...state, reactGridElement, scrollableElement });
            });
        }
    }

    protected updateOnScrollChange = (visibleRangeCalculator: StateModifier) => {
        this.updateState(state => {
            const { scrollTop, scrollLeft } = getScrollOfScrollableElement(state.scrollableElement);
            const { width, height } = getVisibleSizeOfReactGrid(state);
            const shouldBeVisibleRangeRecalc = width > 0 && height > 0 && (
                scrollTop >= state.bottomScrollBoudary || scrollTop <= state.topScrollBoudary ||
                scrollLeft >= state.rightScrollBoudary || scrollLeft <= state.leftScrollBoudary
            );
            return shouldBeVisibleRangeRecalc ? visibleRangeCalculator(state) : state;
        });
    }
}