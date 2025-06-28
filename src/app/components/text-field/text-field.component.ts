import {Component, Input, ViewChild} from '@angular/core';
import {
  ControlContainer,
  ControlValueAccessor,
  FormControl,
  FormControlDirective,
  NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators
} from '@angular/forms';
import {TitleCasePipe} from '@angular/common';

@Component({
  selector: 'text-field',
  templateUrl: './text-field.component.html',
  styleUrl: './text-field.component.scss',
  imports: [TitleCasePipe, ReactiveFormsModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: TextFieldComponent,
    multi: true
  }]
})
export class TextFieldComponent implements ControlValueAccessor {

  @ViewChild(FormControlDirective, {static: true}) formControlDirective: FormControlDirective;
  @Input({required: true}) controlName: string = '';

  protected value: string = '';

  constructor(private controlContainer: ControlContainer) {
  }

  get control() {
    return this.controlContainer.control?.get(this.controlName) as FormControl;
  }

  protected hasRequired() {
    return this.control.hasValidator(Validators.required);
  }

  registerOnChange(fn: any): void {
    this.formControlDirective.valueAccessor?.registerOnChange(fn);
  }

  registerOnTouched(fn: any): void {
    this.formControlDirective.valueAccessor?.registerOnTouched(fn);
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.formControlDirective.valueAccessor?.setDisabledState)
      this.formControlDirective.valueAccessor?.setDisabledState(isDisabled);
  }

  writeValue(value: string): void {
    this.formControlDirective.valueAccessor?.writeValue(value);
  }
}
