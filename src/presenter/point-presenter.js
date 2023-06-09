import {remove, render, replace} from '../framework/render';
import EditFormView from '../View/edit-point-view';
import TripPointView from '../View/event-item-view';
import {compareDates} from '../utils/util';
import {UPDATE_TYPE, USER_ACTION} from '../utils/consts';


const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export class PointPresenter {
  #tripPointList;
  #tripPoint;
  #tripPointFormComponent;
  #tripPointComponent;

  #handleModeChange;
  #onDataChange;
  #destinations;
  #offers;
  #mode = Mode.DEFAULT;


  constructor({
    tripPointList,
    tripPoint,
    handleModeChange,
    destinations,
    offers,
    onDataChange
  }) {
    this.#tripPoint = tripPoint;
    this.#tripPointList = tripPointList;
    this.#handleModeChange = handleModeChange;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#onDataChange = onDataChange;
  }

  init = (tripEvent = this.#tripPoint, destinations = this.#destinations, offers = this.#offers) => {
    const prevTripEventComponent = this.#tripPointComponent;
    const prevTripEventFormComponent = this.#tripPointFormComponent;

    this.#tripPointFormComponent = new EditFormView({
      tripPoint: tripEvent,
      destinations: destinations,
      offers: offers,
      onFormSubmit: (update) => {
        this.#handleFormSubmit(update);
      },
      onRollUpButton: () => {
        this.#replaceFormToEvent();
      },
      onDeleteClick: (update) => {
        this.#handleDeleteClick(update);
      }
    });

    this.#tripPointComponent = new TripPointView({
      tripPoint: tripEvent,
      destinations: destinations,
      offers: offers,
      onRollupClick: () => {
        this.#replacePointToForm();
      }
    });


    if (!prevTripEventComponent || !prevTripEventFormComponent) {
      render(this.#tripPointComponent, this.#tripPointList);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#tripPointComponent, prevTripEventComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#tripPointComponent, prevTripEventFormComponent);
      this.#mode = Mode.DEFAULT;
    }

    remove(prevTripEventComponent);
    remove(prevTripEventFormComponent);
  };

  destroy = () => {
    remove(this.#tripPointComponent);
    remove(this.#tripPointFormComponent);
  };

  resetView = () => {
    if (this.#mode !== Mode.DEFAULT) {
      this.#tripPointFormComponent.reset(this.#tripPoint, this.#offers);
      this.#replaceFormToEvent();
    }
  };

  setSaving = () => {
    if (this.#mode === Mode.EDITING) {
      this.#tripPointFormComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  };

  setDeleting = () => {
    if (this.#mode === Mode.EDITING) {
      this.#tripPointFormComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  };

  #closeEditFormOnEscapeKey = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.#replaceFormToEvent();
    }
  };

  #replacePointToForm = () => {
    replace(this.#tripPointFormComponent, this.#tripPointComponent);
    document.addEventListener('keydown', this.#closeEditFormOnEscapeKey);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  };

  #replaceFormToEvent = () => {
    replace(this.#tripPointComponent, this.#tripPointFormComponent);
    document.removeEventListener('keydown', this.#closeEditFormOnEscapeKey);
    this.#mode = Mode.DEFAULT;
  };

  setAborting = () => {
    if (this.#mode === Mode.DEFAULT) {
      this.#tripPointFormComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#tripPointFormComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#tripPointFormComponent.shake(resetFormState);
  };

  #handleFormSubmit = (update) => {
    const isMinorUpdate = compareDates(this.#tripPoint.dateFrom, update.dateFrom) !== 0 || this.#tripPoint.basePrice !== update.basePrice;
    this.#onDataChange(
      USER_ACTION.UPDATE_TRIPPOINT,
      isMinorUpdate ? UPDATE_TYPE.MINOR : UPDATE_TYPE.PATCH,
      update,
    );
  };

  #handleDeleteClick = (update) => {
    this.#onDataChange(
      USER_ACTION.DELETE_TRIPPOINT,
      UPDATE_TYPE.MINOR,
      update,
    );
  };
}
