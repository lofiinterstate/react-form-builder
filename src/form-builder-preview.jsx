/**
* <Preview />
*/

import React from 'react';
import ReactDOM from 'react-dom';
import Sortable from 'react-sortable-items';
import ElementStore from './stores/ElementStore';
import ElementActions from './actions/ElementActions';
import * as FormElements from './form-elements';
import FormElementsEdit from './form-elements-edit';

export default class FormBuilderPreview extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            errors: [],
            isDirty: false,
        }

        // Keep track of if this is the initial load to set the dirty flag on the form
        this.isInitialLoad = true;

        var loadData = (this.props.url) ? this.props.url : (this.props.data) ? this.props.data : [];
        var saveUrl = (this.props.saveUrl) ? this.props.saveUrl : '';

        this.__onMoveUp     = this.__onMoveUp.bind(this);
        this.__onMoveDown   = this.__onMoveDown.bind(this);

        ElementStore.load(loadData, saveUrl);
        ElementStore.listen(this._onChange.bind(this));
    }

    _setValue(text) {
        return text.replace(/[^A-Z0-9]+/ig, "_").toLowerCase();
    }

    updateElement(element) {
        let data = this.state.data;
        let found = false;

        for(var i=0; i < data.length; i++) {
            if (element.id === data[i].id) {
                data[i] = element;
                found = true;
                break;
            }
        }

        if (found) {
            ElementActions.updateElements(data);
        }
    }

    _onChange(data) {
        if (data.error !== undefined) {
            let errors = this.state.errors;
            errors.push(data.error);

            this.setState({
                errors: errors
            });
        } else {
            let isDirty = true;

            if (this.isInitialLoad === true) {
                this.isInitialLoad = false;
                isDirty = false;
            }

            this.setState({
                data: _.cloneDeep(data),
                isDirty: isDirty,
            });
        }
    }

    __onDestroy(item) {
        ElementActions.deleteElement(item);
    }

    dismissErrors(e) {
        e.preventDefault();
        this.setState({errors: []});
    }

    __onMoveUp(item) {
        let data = this.state.data;
        let position = data.indexOf(item);

        if (position > 0) {
            let item2 = data[position - 1];

            data[position - 1] = item;
            data[position] = item2;

            let $item  = $(ReactDOM.findDOMNode(this.refs[item.id]));
            let $item2 = $(ReactDOM.findDOMNode(this.refs[item2.id]));

            $item.animate({
                'top': $item2.outerHeight() * -1
            });

            $item2.animate({
                'top': $item.outerHeight(),
            }, () => {
                ElementActions.updateElements(data);
            });
        }

    }

    __onMoveDown(item) {
        let data = this.state.data;
        let position = data.indexOf(item);

        if (position < data.length - 1) {
            let item2 = data[position + 1];

            data[position + 1] = item;
            data[position] = item2;

            let $item  = $(ReactDOM.findDOMNode(this.refs[item.id]));
            let $item2 = $(ReactDOM.findDOMNode(this.refs[item2.id]));

            $item.animate({
                'top': $item2.outerHeight()
            });

            $item2.animate({
                'top': $item.outerHeight() * -1,
            }, () => {
                ElementActions.updateElements(data);
            });
        }
    }

    handleSort(orderedIds) {
        let sortedArray = [];
        let data = this.state.data;
        let index = 0;

        for(var i=0; i < data.length; i++) {
            index = orderedIds.indexOf(data[i].id);
            sortedArray[index] = data[i];
        }

        ElementActions.updateElements(sortedArray);
    }

    render() {
        let classes = this.props.className;
        if (this.props.editMode) { classes += ' is-editing'; }

        let items = this.state.data.map( item => {
            let props = {
                key:            item.id,
                ref:            item.id,
                mutable:        false,
                parent:         this.props.parent,
                editModeOn:     this.props.editModeOn,
                isDraggable:    true,
                sortData:       item.id,
                data:           item,
                onDestroy:      this.__onDestroy,
                onMoveUp:       this.__onMoveUp,
                onMoveDown:     this.__onMoveDown,
                requestParams:  this.props.requestParams,
            };

            if (item.defaultValue !== undefined) {
                props.defaultValue = item.defaultValue;
            }

            // Use the element in custom elements if it's found in there, otherwise use the one in the default FormElements
            let element = _.find(this.props.customElements, (element) => {
                return element.toolbarEntry().element === item.element;
            }) || FormElements[item.element];

            // Hide the element if it's hidden from non superusers
            if (item.hidden && !this.props.isSuperUser) {
                props.hidden = true;
            }

            if (element) {
                let reactElement = React.createElement(
                    element,
                    props
                );

                return reactElement;
            } else {
                console.warn('Invalid element type ' + item.element);
            }
        });

        return (
            <div className={classes}>
                { this.state.errors.length > 0 &&
                    <div className="alert alert-danger validation-error">
                        <div className="clearfix">
                            <i className="fa fa-exclamation-triangle pull-left"></i>
                            <ul>
                                {this.state.errors.map((error, index) => <li key={index}>{error}</li>)}
                            </ul>
                        </div>
                        <div className="clearfix">
                            <a className="pull-right btn btn-default btn-sm btn-danger" onClick={this.dismissErrors.bind(this)}>Dismiss</a>
                        </div>
                    </div>
                }
                <div className="edit-form">
                    { this.props.editElement !== null &&
                        <FormElementsEdit
                            files               = {this.props.files}
                            manualEditModeOff   = {this.props.manualEditModeOff}
                            preview             = {this}
                            element             = {this.props.editElement}
                            updateElement       = {this.updateElement}
                            isSuperUser         = {this.props.isSuperUser}
                            tags                = {this.props.tags}
                            requestParams       = {this.props.requestParams} />
                    }
                </div>
                <Sortable sensitivity={0} key={this.state.data.length} onSort={this.handleSort.bind(this)}>
                    {items}
                </Sortable>
            </div>
        )
    }
}

FormBuilderPreview.defaultProps = {
    files: [],
    editMode: false,
    editElement: null,
    className: '',
    tags: [],
    customElements: [],
}
