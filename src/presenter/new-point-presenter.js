import { render, remove, RenderPosition } from '../framework/render';
import EditFormView from '../View/edit-point-view';
import {USER_ACTION, UPDATE_TYPE} from '../utils/consts';

export default class NewTripPointPresenter {
  #handleDataChange ;
  #handleDestroy ;
  #tripPointListContainer ;
  #tripPointEditComponent ;

  constructor({tripPointListContainer, onDataChange, onDestroy}) {
    this.#tripPointListContainer = tripPointListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
  }

  init = (destinations, offers) => {
    if (this.#tripPointEditComponent !== undefined) {
      return;
    }

    this.#tripPointEditComponent = new EditFormView({
      destinations: destinations,
      offers: offers,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick,
      isEditForm: false
    });

    render(this.#tripPointEditComponent, this.#tripPointListContainer,
      RenderPosition.AFTERBEGIN);

    document.body.addEventListener('keydown', this.#ecsKeyDownHandler);
  };

  destroy = () => {
    if (this.#tripPointEditComponent === undefined) {
      return;
    }

    this.#handleDestroy();

    remove(this.#tripPointEditComponent);
    this.#tripPointEditComponent = undefined;

    document.body.removeEventListener('keydown', this.#ecsKeyDownHandler);
  };


  #ecsKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.destroy();
    }
  };

  setSaving = () => {
    this.#tripPointEditComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  };

  setAborting = () => {
    const resetFormState = () => {
      this.#tripPointEditComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#tripPointEditComponent.shake(resetFormState);
  };

  #handleFormSubmit = (tripPoint) => {
    this.#handleDataChange(
      USER_ACTION.ADD_TRIPPOINT,
      UPDATE_TYPE.MINOR,

      this.#deleteId(tripPoint)
    );

  };

  #handleDeleteClick = () => {
    this.destroy();
  };

  #deleteId = (tripPoint) => {
    delete tripPoint.id;
    return tripPoint;
  };

}
