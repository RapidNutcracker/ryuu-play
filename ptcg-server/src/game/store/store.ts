import { Action } from "./actions/action";
import { AppendLogAction } from "./actions/append-log-action";
import { Effect } from "./effects/effect";
import { GameError, GameMessage } from "../game-error";
import { Prompt } from "./prompts/prompt";
import { ReorderHandAction, ReorderBenchAction } from "./actions/reorder-actions";
import { ResolvePromptAction } from "./actions/resolve-prompt-action";
import { State } from "./state/state";
import { StateLog } from "./state/state-log";
import { StoreHandler } from "./store-handler";
import { StoreLike } from "./store-like";
import { generateId, deepClone } from "../../utils/utils";
import { attackReducer } from "./effect-reducers/attack-effect";
import { playCardReducer } from "./reducers/play-card-reducer";
import { playEnergyReducer } from "./effect-reducers/play-energy-effect";
import { playPokemonReducer } from "./effect-reducers/play-pokemon-effect";
import { playTrainerReducer } from "./effect-reducers/play-trainer-effect";
import { playerTurnReducer } from "./reducers/player-turn-reducer";
import { gamePhaseReducer } from "./effect-reducers/game-phase-effect";
import { checkStateReducer, checkState } from "./effect-reducers/check-state-effect";
import { retreatReducer } from "./effect-reducers/retreat-effect";
import { reorderReducer} from "./reducers/reorder-reducer";
import { setupPhaseReducer } from './reducers/setup-reducer';

interface PromptItem {
  ids: number[],
  then: (results: any) => void;
}

export class Store implements StoreLike {

  public state: State = new State();
  private promptItems: PromptItem[] = [];
  private logId: number = 0;

  constructor(private handler: StoreHandler) { };

  public dispatch(action: Action): State {
    let state = this.state;

    if (action instanceof ReorderHandAction
      || action instanceof ReorderBenchAction) {
      state = reorderReducer(this, state, action);
      this.handler.onStateChange(state);
      return state;
    }

    if (action instanceof ResolvePromptAction) {
      state = this.reducePrompt(state, action);
      if (this.promptItems.length === 0) {
        state = checkState(this, state);
      }
      this.handler.onStateChange(state);
      return state;
    }

    if (action instanceof AppendLogAction) {
      this.log(state, action.message, action.id);
      this.handler.onStateChange(state);
      return state;
    }

    if (state.prompts.some(p => p.result === undefined)) {
      throw new GameError(GameMessage.ACTION_IN_PROGRESS);
    }

    state = this.reduce(state, action);

    return state;
  }

  public reduceEffect(state: State, effect: Effect): State {
    state = this.propagateEffect(state, effect);

    if (effect.preventDefault === true) {
      return state;
    }

    state = gamePhaseReducer(this, state, effect);
    state = playEnergyReducer(this, state, effect);
    state = playPokemonReducer(this, state, effect);
    state = playTrainerReducer(this, state, effect);
    state = retreatReducer(this, state, effect);
    state = attackReducer(this, state, effect);
    state = checkStateReducer(this, state, effect);

    return state;
  }

  public prompt(state: State, prompts: Prompt<any>[] | Prompt<any>, then: (results: any) => void): State {
    if (!(prompts instanceof Array)) {
      prompts = [prompts];
    }

    for (let i = 0; i < prompts.length; i++) {
      const id = generateId(state.prompts);
      prompts[i].id = id;
      state.prompts.push(prompts[i]);
    }

    const promptItem: PromptItem = {
      ids: prompts.map(prompt => prompt.id),
      then: then
    };

    this.promptItems.push(promptItem);
    return state;
  }

  public log(state: State, message: string, client?: number): void {
    const log = new StateLog(message, client);
    log.id = ++this.logId;
    state.logs.push(log);
  }

  private reducePrompt(state: State, action: ResolvePromptAction): State {
    // Resolve prompts actions
    const prompt = state.prompts.find(item => item.id === action.id);
    const promptItem = this.promptItems.find(item => item.ids.indexOf(action.id) !== -1);

    if (prompt === undefined || promptItem === undefined) {
      throw new GameError(GameMessage.ILLEGAL_ACTION);
    }

    if (prompt.result !== undefined) {
      throw new GameError(GameMessage.PROMPT_ALREADY_RESOLVED);
    }

    try {
      prompt.result = action.result;

      const results = promptItem.ids.map(id => {
        const p = state.prompts.find(item => item.id === id);
        return p === undefined ? undefined : p.result;
      });

      if (action.log !== undefined) {
        this.log(state, action.log.message, action.log.client);
      }

      if (results.every(result => result !== undefined)) {
        const itemIndex = this.promptItems.indexOf(promptItem);
        promptItem.then(results.length === 1 ? results[0] : results);
        this.promptItems.splice(itemIndex, 1);
      }
    } catch (storeError) {
      // Illegal action
      prompt.result = undefined;
      throw storeError;
    }

    return state;
  }

  private reduce(state: State, action: Action): State {
    let stateBackup = deepClone(state);
    this.promptItems.length = 0;

    try {
      state = setupPhaseReducer(this, state, action);
      state = playCardReducer(this, state, action);
      state = playerTurnReducer(this, state, action);

      if (this.promptItems.length === 0) {
        state = checkState(this, state);
      }
    } catch (storeError) {
      // Illegal action
      this.state = stateBackup;
      this.promptItems.length = 0;
      throw storeError;
    }

    this.handler.onStateChange(state);
    return state;
  }

  private propagateEffect(state: State, effect: Effect): State {
    for (let player of state.players) {
      player.stadium.cards.forEach(c => { state = c.reduceEffect(this, state, effect); });
      player.active.cards.forEach(c => { state = c.reduceEffect(this, state, effect); });
      for (let bench of player.bench) {
        bench.cards.forEach(c => { state = c.reduceEffect(this, state, effect); });
      }
      player.hand.cards.forEach(c => { state = c.reduceEffect(this, state, effect); });
    }
    return state;
  }
}
