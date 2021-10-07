import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PromptChoosePokemonComponent } from './prompt-choose-pokemon.component';

describe('PromptChoosePokemonComponent', () => {
  let component: PromptChoosePokemonComponent;
  let fixture: ComponentFixture<PromptChoosePokemonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PromptChoosePokemonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptChoosePokemonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
