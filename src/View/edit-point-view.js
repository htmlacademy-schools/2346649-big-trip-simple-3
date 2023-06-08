import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {convertToBasicTime, convertToUpperCase, getItemFromItemsById} from '../utils/util';
import {TRIP_TYPES} from '../utils/consts';
import he from 'he';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const dateNow = () => {
  const currentDate = new Date();

  const dateFrom = new Date(currentDate);
  dateFrom.setDate(dateFrom.getDate() + 1);
  const formattedDateFrom = dateFrom.toISOString();

  const dateTo = new Date(currentDate);
  dateTo.setDate(dateTo.getDate() + 8);
  const formattedDateTo = dateTo.toISOString();

  return {formattedDateTo, formattedDateFrom};
};


const createDestinationPicsTemplate = (destination) => (destination.pictures
  .map((pic) => `
  <img class="event__photo" src="${pic.src}" alt="${pic.description}">
  `)
  .join('')
);

const createDestinationDescriptionTemplate = (destination) => ((destination) ? `
  <div class="event__photos-container">
    <div class="event__photos-tape">
      ${createDestinationPicsTemplate(destination)}
    </div>
  </div>` : ''
);

const createOffersTemplate = (currentTypeOffers, checkedOffers, id, isDisabled) => (currentTypeOffers
  .map((offer) => {
    const isOfferChecked = checkedOffers.includes(offer.id) ? 'checked' : '';
    return `
    <div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.id}-${id}" type="checkbox" name="event-offer-${offer.id}" ${isOfferChecked} ${(isDisabled) ? 'disabled' : ''}>
      <label class="event__offer-label" for="event-offer-${offer.id}-${id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>`;
  })
  .join('')
);

const createEventDetailsTemplate = (tripPoint, destination, offers, isDisabled) => {
  const currentTypeOffers = offers.find((el) => el.type === tripPoint.type).offers;
  return `
  <section class="event__section  event__section--offers ${(currentTypeOffers.length === 0) ? 'visually-hidden' : ''}" >
    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
    <div class="event__available-offers">
      ${createOffersTemplate(currentTypeOffers, tripPoint.offersIDs, tripPoint.id, isDisabled)}
    </div>
  </section>

  <section class="event__section  event__section--destination ${(destination) ? '' : 'visually-hidden'}">
    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
    <p class="event__destination-description">${destination.description}</p>
    ${createDestinationDescriptionTemplate(destination)}
  </section>`;
};

const generateRollupButton = (isEditForm) => ((!isEditForm) ? '' : `
  <button class="event__rollup-btn" type="button">
    <span class="visually-hidden">Open event</span>
  </button>`
);

const createEventTypeList = (currentType, currentId) => (TRIP_TYPES
  .map((type) => `
  <div class="event__type-item">
    <input id="event-type-${type}-${currentId}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${(type === currentType) ? 'checked' : ''}>
    <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-${currentId}">${convertToUpperCase(type)}</label>
  </div>`
  )
  .join('')
);

const createDestinationList = (destinations) => (destinations
  .map((destination) => `
    <option value="${destination.name}"></option>`)
  .join(''));

const getDeleteTitle = (isEditForm, isDeleting) => {
  if (!isEditForm) {
    return 'Cancel';
  }
  return (isDeleting) ? 'Deleting...' : 'Delete';
};


const createEditFormTemplate = (tripPoint, destinations, offers, isEditForm) => {
  if (!tripPoint.destination) {
    tripPoint.destination = destinations[0].id;
  }
  const destination = getItemFromItemsById(destinations, tripPoint.destination);
  return (
    `<li class="trip-events__item">
    <form class="event event--edit" action="#" method="post">
    <header class="event__header">
      <div class="event__type-wrapper">
        <label class="event__type event__type-btn" for="event-type-toggle-${tripPoint.id}">
          <span class="visually-hidden">Choose event type</span>
          <img class="event__type-icon" width="17" height="17" src="img/icons/${tripPoint.type}.png" alt="${tripPoint.type}">
        </label>
        <input class="event__type-toggle visually-hidden" id="event-type-toggle-${tripPoint.id}" type="checkbox" ${(tripPoint.isDisabled) ? 'disabled' : ''}>

        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Event type</legend>
            ${createEventTypeList(tripPoint.type, tripPoint.id)}
          </fieldset>
        </div>
      </div>

      <div class="event__field-group event__field-group--destination">
        <label class="event__label event__type-output" for="event-destination-${tripPoint.id}">
        ${convertToUpperCase(tripPoint.type)}
        </label>
        <input class="event__input event__input--destination" id="event-destination-${tripPoint.id}" type="text" name="event-destination" value="${he.encode(destination.name) }" list="destination-list-${tripPoint.id}" autocomplete="off" ${(tripPoint.isDisabled) ? 'disabled' : ''}>
        <datalist id="destination-list-${tripPoint.id}">
          ${createDestinationList(destinations)}
        </datalist>
      </div>

      <div class="event__field-group  event__field-group--time">
        <label class="visually-hidden" for="event-start-time-${tripPoint.id}">From</label>
        <input class="event__input event__input--time" id="event-start-time-${tripPoint.id}" type="text" name="event-start-time" value="${convertToBasicTime(tripPoint.dateFrom)}" ${(tripPoint.isDisabled) ? 'disabled' : ''}>
        &mdash;
        <label class="visually-hidden" for="event-end-time-${tripPoint.id}">To</label>
        <input class="event__input event__input--time" id="event-end-time-${tripPoint.id}" type="text" name="event-end-time" value="${convertToBasicTime(tripPoint.dateTo)}" ${(tripPoint.isDisabled) ? 'disabled' : ''}>
      </div>

      <div class="event__field-group event__field-group--price">
        <label class="event__label" for="event-price-${tripPoint.id}">
          <span class="visually-hidden">Price</span>
          &euro;
        </label>
        <input class="event__input event__input--price" id="event-price-${tripPoint.id}" type="number" name="event-price" value="${tripPoint.basePrice}" autocomplete="off" min="0" max="9999999" ${(tripPoint.isDisabled) ? 'disabled' : ''}>
      </div>

      <button class="event__save-btn  btn  btn--blue" type="submit" ${(tripPoint.isDisabled) ? 'disabled' : ''}>${(tripPoint.isSaving) ? 'Saving...' : 'Save'}</button>
      <button class="event__reset-btn" type="reset" ${(tripPoint.isDisabled) ? 'disabled' : ''}>${getDeleteTitle(isEditForm, tripPoint.isDeleting)}</button>
      ${generateRollupButton(isEditForm)}
    </header>
    <section class="event__details">
      ${createEventDetailsTemplate(tripPoint, destination, offers, tripPoint.isDisabled)}
    </section>
  </form>
  </li>`
  );
};

export default class EditFormView extends AbstractStatefulView {
  #destinations;
  #offers;
  #isEditForm;
  #fromDatepicker;
  #toDatepicker;

  constructor({tripPoint = {
    basePrice: 500,
    dateFrom: dateNow().formattedDateFrom,
    dateTo: dateNow().formattedDateTo,
    destination: undefined,
    id: 0,
    offersIDs: [],
    type: 'bus'
  }, destinations, offers, onFormSubmit, onRollUpButton, isEditForm = true, onDeleteClick}) {
    super();
    this._setState(EditFormView.parseTripPointToState(tripPoint, offers));

    this.#destinations = destinations;
    this.#offers = offers;
    this.#isEditForm = isEditForm;
    this._callback.onFormSubmit = onFormSubmit;
    this._callback.onRollUpButton = onRollUpButton;
    this._callback.onDeleteClick = onDeleteClick;

    this._restoreHandlers();
  }

  removeElement() {
    super.removeElement();


    if (this.#fromDatepicker) {
      this.#fromDatepicker.destroy();
      this.#fromDatepicker = undefined;
    }

    if (this.#toDatepicker) {
      this.#toDatepicker.destroy();
      this.#toDatepicker = undefined;
    }
  }

  get template() {
    return createEditFormTemplate(this._state, this.#destinations, this.#offers, this.#isEditForm);
  }

  reset(tripPoint) {
    this.updateElement(
      EditFormView.parseTripPointToState(tripPoint, this.#offers),
    );
  }

  _restoreHandlers() {
    this.element.querySelector('.event--edit')
      .addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__type-group')
      .addEventListener('change', this.#eventTypeHandler);
    this.element.querySelector('.event__input--destination')
      .addEventListener('change', this.#destinationHandler);
    this.element.querySelector('.event__input--price')
      .addEventListener('input', this.#priceInputHandler);
    this.element.querySelector('.event__available-offers')
      .addEventListener('change', this.#offersHandler);
    this.element.querySelector('.event__reset-btn')
      .addEventListener('click', this.#formResetClickHandler);
    if (this.#isEditForm) {
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#rollUpButtonHandler);
    }
    this.#setFromDatePicker();
    this.#setToDatePicker();
  }

  #fromDateChangeHandler = ([userDate]) => {
    if (userDate) {
      this._setState({
        dateFrom: userDate.toISOString(),
      });
      this.#toDatepicker.set('minDate', userDate);
    }
  };


  #toDateChangeHandler = ([userDate]) => {
    if (userDate) {
      this._setState({
        dateTo: userDate.toISOString(),
      });
    }
  };

  #setFromDatePicker = () => {
    this.#fromDatepicker = flatpickr(
      this.element.querySelector(`#event-start-time-${this._state.id}`),
      {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: convertToBasicTime(this._state.dateFrom),
        onChange: this.#fromDateChangeHandler,
      },
    );
  };

  #setToDatePicker = () => {
    this.#toDatepicker = flatpickr(
      this.element.querySelector(`#event-end-time-${this._state.id}`),
      {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: convertToBasicTime(this._state.dateTo),
        minDate: convertToBasicTime(this._state.dateFrom),
        onChange: this.#toDateChangeHandler,
      },
    );
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this._callback.onFormSubmit(EditFormView.parseStateToTripPoint(this._state));
  };

  #rollUpButtonHandler = (evt) => {
    evt.preventDefault();
    this._callback.onRollUpButton();
  };

  #formResetClickHandler = (evt) => {
    evt.preventDefault();
    this._callback.onDeleteClick(EditFormView.parseStateToTripPoint(this._state));
  };

  #eventTypeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      type: evt.target.value,
      offersIDs: [],
      currentTypeOffers: this.#offers.find((el) => el.type === evt.target.value).offers
    });
  };

  #destinationHandler = (evt) => {
    const newDest = this.#destinations.find((destination) => destination.name === evt.target.value);
    if (!newDest) {
      return;
    }
    evt.preventDefault();
    this.updateElement({
      destination: newDest.id,
    });
  };

  #priceInputHandler = (evt) => {
    evt.preventDefault();
    this._setState({
      basePrice: evt.target.value,
    });
  };

  #offersHandler = (evt) => {
    evt.preventDefault();
    const clickedOfferId = Number(evt.target.name.split('-').at(-1));
    const newOffersIds = this._state.offersIDs.slice();
    if (newOffersIds.includes(clickedOfferId)) {
      newOffersIds.splice(newOffersIds.indexOf(clickedOfferId), 1);
    } else {
      newOffersIds.push(clickedOfferId);
    }
    this._setState({
      offersIDs: newOffersIds
    });
  };

  static parseTripPointToState(tripPoint, offers) {
    return {...tripPoint,
      currentTypeOffers: offers.find((el) => el.type === tripPoint.type).offers,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };
  }

  static parseStateToTripPoint(state) {
    const tripPoint = {...state};

    delete tripPoint.currentTypeOffers;
    delete tripPoint.isDisabled;
    delete tripPoint.isSaving;
    delete tripPoint.isDeleting;
    return tripPoint;
  }
}
