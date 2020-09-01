import { Injectable } from '@angular/core';
import { map } from 'rxjs/internal/operators/map';
import { Replay, GameState } from 'ptcg-server';

import { ApiService } from '../api.service';
import { GameService } from './game.service';
import { ReplayResponse } from '../interfaces/replay.interface';


@Injectable()
export class ReplayService {

  constructor(
    private api: ApiService,
    private gameService: GameService
  ) {}

  public getMatchReplay(matchId: number) {
    return this.api.get<ReplayResponse>('/replays/match/' + matchId)
      .pipe(map(response => {
        const replay = new Replay();
        replay.deserialize(response.replayData);

        const gameState: GameState = {
          gameId: 0,
          state: replay.getState(0),
          clientIds: []
        };

        return this.gameService.appendGameState(gameState, replay);
      }));
  }

}
