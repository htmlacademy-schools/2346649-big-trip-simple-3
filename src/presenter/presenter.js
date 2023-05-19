import SortView from '../view/sort-view';
import EventListView from '../view/events-list-view';
import EventItemView from '../view/event-item-view';
import EditPointView from '../View/edit-point-view';
import NewItemFormView from '../view/create-form-view';
import { render } from '../render';

export default class Presenter {
  tripListComponent = new EventListView();

  init(container) {
    this.container = container;

    render(new SortView(), this.container);
    render(this.tripListComponent, this.container);
    render(new NewItemFormView(), this.tripListComponent.getElement());
    render(new EditPointView(), this.tripListComponent.getElement());
    for (let i = 0; i < 3; i++) {
      render(new EventItemView(), this.tripListComponent.getElement());
    }
  }
}
