import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CardType, SuperType } from 'ptcg-server';
import { MatSelectChange } from '@angular/material/select';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { Deck } from '../../api/interfaces/deck.interface';
import { DeckEditToolbarFilter } from './deck-edit-toolbar-filter.interface';
import { ImportDeckPopupService } from '../import-deck-popup/import-deck-popup.service';

@UntilDestroy()
@Component({
  selector: 'ptcg-deck-edit-toolbar',
  templateUrl: './deck-edit-toolbar.component.html',
  styleUrls: ['./deck-edit-toolbar.component.scss']
})
export class DeckEditToolbarComponent {

  @Input() deck: Deck;

  @Input() disabled: boolean;

  @Output() filterChange = new EventEmitter<DeckEditToolbarFilter>();

  @Output() save = new EventEmitter<void>();

  @Output() import = new EventEmitter<string[]>();

  @Output() export = new EventEmitter<void>();

  public cardTypes = [
    { value: CardType.NONE, label: 'LABEL_NONE' },
    { value: CardType.COLORLESS, label: 'LABEL_COLORLESS' },
    { value: CardType.GRASS, label: 'LABEL_GRASS' },
    { value: CardType.FIGHTING, label: 'LABEL_FIGHTING' },
    { value: CardType.PSYCHIC, label: 'LABEL_PSYCHIC' },
    { value: CardType.WATER, label: 'LABEL_WATER' },
    { value: CardType.LIGHTNING, label: 'LABEL_LIGHTNING' },
    { value: CardType.METAL, label: 'LABEL_METAL' },
    { value: CardType.DARKNESS, label: 'LABEL_DARKNESS' },
    { value: CardType.FIRE, label: 'LABEL_FIRE' },
    { value: CardType.DRAGON, label: 'LABEL_DRAGON' },
    { value: CardType.FAIRY, label: 'LABEL_FAIRY' },
  ];

  public superTypes = [
    { value: SuperType.POKEMON, label: 'LABEL_POKEMON' },
    { value: SuperType.TRAINER, label: 'LABEL_TRAINER' },
    { value: SuperType.ENERGY, label: 'LABEL_ENERGY' },
  ];

  public sets = [
    { value: 'WBSP', label: 'LABEL_WIZARDS_BLACK_STAR_PROMOS' },
    { value: 'BS', label: 'LABEL_BASE' },
    { value: 'JU', label: 'LABEL_JUNGLE' },
    { value: 'FO', label: 'LABEL_FOSSIL' },
    { value: 'HGSS', label: 'LABEL_HGSS' },
    { value: 'BRS', label: 'LABEL_BRILLIANT_STARS' },
    { value: 'LOR', label: 'LABEL_LOST_ORIGIN' },
    { value: 'SVP', label: 'LABEL_SCARLET_AND_VIOLET_PROMOS' },
    { value: 'SVI', label: 'LABEL_SCARLET_AND_VIOLET' },
    { value: 'SVE', label: 'LABEL_SCARLET_AND_VIOLET_ENERGY' },
    { value: 'PAL', label: 'LABEL_PALDEA_EVOLVED' },
    { value: 'OBF', label: 'LABEL_OBSIDIAN_FLAMES' },
    { value: 'M23', label: 'LABEL_MCDONALDS_MATCH_BATTLE_2023' },
    { value: 'MEW', label: 'LABEL_151' },
    { value: 'PAR', label: 'LABEL_PARADOX_RIFT' },
    { value: 'PAF', label: 'LABEL_PALDEAN_FATES' },
    { value: 'TEF', label: 'LABEL_TEMPORAL_FORCES' },
    { value: 'TWM', label: 'LABEL_TWILIGHT_MASQUERADE' },
    { value: 'SFA', label: 'LABEL_SHROUDED_FABLE' },
    { value: 'SCR', label: 'LABEL_STELLAR_CROWN' },
    { value: 'SSP', label: 'LABEL_SURGING_SPARKS' },
    { value: 'PRE', label: 'LABEL_PRISMATIC_EVOLUTIONS' },
  ];

  public filterValue: DeckEditToolbarFilter;

  constructor(
    private importDeckPopupService: ImportDeckPopupService
  ) {
    this.filterValue = {
      searchValue: '',
      superTypes: [],
      cardTypes: [],
      sets: '',
    };
  }

  public onSave() {
    this.save.next();
  }

  public onSearch(value: string) {
    this.filterValue.searchValue = value;
    this.filterChange.next({ ...this.filterValue });
  }

  public onSuperTypeChange(change: MatSelectChange) {
    this.filterValue.superTypes = change.value;
    this.filterChange.next({ ...this.filterValue });
  }

  public onCardTypeChange(change: MatSelectChange) {
    this.filterValue.cardTypes = change.value;
    this.filterChange.next({ ...this.filterValue });
  }

  public onSetChange(change: MatSelectChange) {
    this.filterValue.sets = change.value;
    this.filterChange.next({ ...this.filterValue });
  }

  public importFromFile() {
    const dialogRef = this.importDeckPopupService.openDialog();
    dialogRef.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: cardNames => {
          if (cardNames) {
            this.import.next(cardNames);
          }
        }
      });
  }

  public exportToFile() {
    this.export.next();
  }

}
