export type State = {
  [entry: string]: {
    present: any,
    past: any[],
    future: any[]
  }
};

/**
 * Helper class for state/undo-redo.
 *
 * @class
 */
export class UndoUtil {

  /**
   * Checks if at least one state is undoable or not.
   *
   * @param {Object} state The global state.
   * @return {boolean} Whether at least one state is undoable or not.
   */
  static atLeastOneUndoable(state: State): boolean {
    for (let [k, v] of Object.entries(state)) {
      if (k && v && v.past && v.past.length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if at least one state is redoable or not.
   *
   * @param {Object} state The global state.
   * @return {boolean} Whether at least one state is redoable or not.
   */
  static atLeastOneRedoable(state: State) {
    for (let [k, v] of Object.entries(state)) {
      if (k && v && v.future && v.future.length > 0) {
        return true;
      }
    }
    return false;
  }

}

export default UndoUtil;
