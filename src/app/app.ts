import {Component, OnDestroy, OnInit, Signal, signal, WritableSignal} from '@angular/core';
import {TextFieldComponent} from './components/text-field/text-field.component';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {combineLatest, map, Observable, startWith, Subject, switchMap, takeUntil, tap} from 'rxjs';
import {Film, FilmUrl, StarWarsService} from './services/star-wars-service';
import {AsyncPipe} from '@angular/common';

export type InputType = 'starship' | 'people' | 'vehicle';

@Component({
  selector: 'app-root',
  imports: [
    TextFieldComponent,
    ReactiveFormsModule
  ],
  providers: [StarWarsService],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {

  protected readonly fieldNames: string[] = ['starship', 'people', 'vehicle'];
  protected form: FormGroup;
  protected films: WritableSignal<Film[]> = signal([]);

  private readonly defaultValidators = [Validators.required, Validators.minLength(3)];
  private unsub: Subject<void> = new Subject<void>();

  constructor(private starWarsService: StarWarsService) {
  }

  ngOnInit() {
    this.form = this.createFormGroup();

    this.fieldNames.forEach(name => this.form.get(name)?.valueChanges.pipe(takeUntil(this.unsub))
      .subscribe(() => this.onOneInputChange(name)));
    this.form.valueChanges.pipe(takeUntil(this.unsub))
      .subscribe((groupObj: { [key: string]: string }) => {
        if (!Object.values(groupObj).join('').length) {
          this.fieldNames.forEach(name => {
            const control = this.form.get(name);
            control?.setValidators(this.defaultValidators);
            this.resetAndUpdateValidity(control as FormControl);
          });
        }
      });

    this.starWarsService.getAllFilms().then(films => {
      this.films.set(films.map(film => ({...film, marked: false})));
    });
  }

  ngOnDestroy() {
    this.unsub.next()
    this.unsub.complete();
  }

  async submitForm() {
    for (const [key, value] of Object.entries(this.form.value)) {
      if (value !== '') {
        const urls = await this.starWarsService.search({query: value as string, type: key as InputType})
        const markRecord: Record<string, boolean> = {};
        urls.forEach(url => {
          markRecord[url] = true;
        })
        const markedFilms = this.films().map(film => ({...film, marked: markRecord[film.url]}));
        this.films.set(markedFilms);
      }
    }
  }

  private createFormGroup() {
    const formGroup: Record<string, FormControl> = {};
    for (let name of this.fieldNames) {
      formGroup[name] = new FormControl('', {validators: this.defaultValidators, nonNullable: true});
    }
    return new FormGroup(formGroup);
  }

  private onOneInputChange(name: string) {
    // One of three input is changing
    const control = this.form.get(name);
    if (!control?.validator) {
      control?.setValidators(this.defaultValidators);
      control?.updateValueAndValidity({emitEvent: false});
    }

    this.fieldNames.forEach(other => {
      if (other !== name) {
        const otherControl = this.form.get(other);
        if (otherControl?.validator) {
          otherControl?.clearValidators();
          this.resetAndUpdateValidity(otherControl as FormControl);
        }
      }
    })
  }

  private resetAndUpdateValidity(control: FormControl) {
    control?.reset('', {emitEvent: false});
    control?.updateValueAndValidity({emitEvent: false});
  }
}
