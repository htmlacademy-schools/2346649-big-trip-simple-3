import {remove, render, replace} from '../framework/render';
import EventItemView from '../View/event-item-view';
import EditFormView from '../View/edit-point-view';
import {UPDATE_TYPE, USER_ACTION} from '../utils/consts';
import {datesAreEqual} from '../utils/util';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #handleModeChange;
  #handleDataChange;

  #tripPointList;
  #editFormComponent;
  #tripPointComponent;

  #tripPoint;
  #destinations;
  #offers;
  #mode = Mode.DEFAULT;

  constructor({tripPointList, onModeChange, onDataChange}) {
    this.#tripPointList = tripPointList;
    this.#handleModeChange = onModeChange;
    this.#handleDataChange = onDataChange;
  }

  init(tripPoint, destinations, offers) {
    this.#tripPoint = tripPoint;
    this.#destinations = destinations;
    this.#offers = offers;
    const prevTripPointComponent = this.#tripPointComponent;
    const prevEditFormComponent = this.#editFormComponent;
    this.#tripPointComponent = new EventItemView({
      tripPoint: this.#tripPoint,
      destinations: this.#destinations,
      offers: this.#offers,
      onEditClick: this.#handleEditClick,
    });
    this.#editFormComponent = new EditFormView({
      tripPoint: this.#tripPoint,
      destinations: this.#destinations,
      offers: this.#offers,
      onFormSubmit: this.#handleFormSubmit,
      onRollUpButton: this.#handleRollupButtonClick,
      onDeleteClick: this.#handleDeleteClick
    });
    if (prevTripPointComponent === undefined || prevEditFormComponent === undefined) {
      render(this.#tripPointComponent, this.#tripPointList);
      return;
    }
    switch (this.#mode) {
      case Mode.DEFAULT:
        replace(this.#tripPointComponent, prevTripPointComponent);
        break;
      case Mode.EDITING:
        replace(this.#tripPointComponent, prevEditFormComponent);
        this.#mode = Mode.DEFAULT;
    }
    remove(prevEditFormComponent);
    remove(prevTripPointComponent);
  }

  destroy() {
    remove(this.#tripPointComponent);
    remove(this.#editFormComponent);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#editFormComponent.reset(this.#tripPoint);
      this.#replaceFormToPoint();
    }
  }

  setSaving() {
    if (this.#mode === Mode.EDITING) {
      this.#editFormComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.EDITING) {
      this.#editFormComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  #replacePointToForm = () => {
    replace(this.#editFormComponent, this.#tripPointComponent);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  };

  #replaceFormToPoint = () => {
    replace(this.#tripPointComponent, this.#editFormComponent);
    this.#mode = Mode.DEFAULT;
    document.body.removeEventListener('keydown', this.#ecsKeyDownHandler);
  };

  #ecsKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#editFormComponent.reset(this.#tripPoint);
      this.#replaceFormToPoint();
      document.body.removeEventListener('keydown', this.#ecsKeyDownHandler);
    }
  };

  #handleEditClick = () => {
    this.#replacePointToForm();
    document.body.addEventListener('keydown', this.#ecsKeyDownHandler);
  };

  setAborting = () => {
    if (this.#mode === Mode.DEFAULT) {
      this.#tripPointComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#editFormComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#editFormComponent.shake(resetFormState);
  };

  #handleFormSubmit = (update) => {
    const isMinorUpdate = !datesAreEqual(this.#tripPoint.dateFrom, update.dateFrom) || this.#tripPoint.basePrice !== update.basePrice;
    this.#handleDataChange(
      USER_ACTION.UPDATE_TRIPPOINT,
      isMinorUpdate ? UPDATE_TYPE.MINOR : UPDATE_TYPE.PATCH,
      update,
    );
    document.body.removeEventListener('keydown', this.#ecsKeyDownHandler);
  };

  #handleRollupButtonClick = () => {
    this.#editFormComponent.reset(this.#tripPoint);
    this.#replaceFormToPoint();
  };

  #handleDeleteClick = (tripPoint) => {
    this.#handleDataChange(
      USER_ACTION.DELETE_TRIPPOINT,
      UPDATE_TYPE.MINOR,
      tripPoint,
    );
  };
}
