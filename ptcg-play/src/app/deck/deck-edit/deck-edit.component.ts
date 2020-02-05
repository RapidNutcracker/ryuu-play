import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { switchMap, finalize } from 'rxjs/operators';
import { CardType, SuperType } from 'ptcg-server';

import { AlertService } from 'src/app/shared/alert/alert.service';
import { CardsBaseService } from 'src/app/shared/cards/cards-base.service';
import { DeckService } from 'src/app/api/services/deck.service';
import { takeUntilDestroyed } from '../../shared/operators/take-until-destroyed';

@Component({
  selector: 'ptcg-deck-edit',
  templateUrl: './deck-edit.component.html',
  styleUrls: ['./deck-edit.component.scss']
})
export class DeckEditComponent implements OnInit, OnDestroy {

  public loading = false;
  public deckName: string;
  public cards: string[];

  public cardTypes = [
    {value: CardType.NONE, label: 'None' },
    {value: CardType.COLORLESS, label: 'Colorless' },
    {value: CardType.GRASS, label: 'Grass' },
    {value: CardType.FIGHTING, label: 'Fighting' },
    {value: CardType.PSYCHIC, label: 'Psychic' },
    {value: CardType.WATER, label: 'Water' },
    {value: CardType.LIGHTNING, label: 'Lightning' },
    {value: CardType.METAL, label: 'Metal' },
    {value: CardType.DARK, label: 'Dark' },
    {value: CardType.FIRE, label: 'Fire' },
    {value: CardType.DRAGON, label: 'Dragon' },
    {value: CardType.FAIRY, label: 'Fairy' },
  ];

  public superTypes = [
    {value: SuperType.POKEMON, label: 'Pokemon' },
    {value: SuperType.TRAINER, label: 'Trainer' },
    {value: SuperType.ENERGY, label: 'Energy' },
  ];

  constructor(
    private alertService: AlertService,
    private cardsBaseService: CardsBaseService,
    private deckService: DeckService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.cards = this.cardsBaseService.getCardNames();

    this.route.paramMap.pipe(
      switchMap(paramMap => {
        this.loading = true;
        const deckId = parseInt(paramMap.get('deckId'), 10);
        return this.deckService.getDeck(deckId);
      }),
      finalize(() => { this.loading = false; }),
      takeUntilDestroyed(this)
    )
      .subscribe(response => {
        this.deckName = response.deck.name;
      }, async error => {
        await this.alertService.error('Error while loading the deck');
        this.router.navigate(['/decks']);
      });
  }

  ngOnDestroy() { }

  public onSearch(value: string) {
    return;
  }

}
