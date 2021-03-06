/**
  * <DynamicOptionList />
  */

import React from 'react';
import ID from './UUID';

export default class DynamicOptionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      element: this.props.element,
      data: this.props.data,
      dirty: false
    }
  }
  _setValue(text) {
    return text; // This used to be snake case but it makes more sense for searching to just use the value
  }
  editOption(option_index, e) {
    let this_element = this.state.element;
    this_element.options[option_index].label = e.target.value;
    this_element.options[option_index].value = this._setValue(e.target.value);
    this.setState({
      element: this_element,
      dirty: true
    });
  }
  editOptionDefault(option_index, e) {
    let this_element = this.state.element;

    if (this_element.options[option_index].hasOwnProperty("default")) {
      delete(this_element.options[option_index]["default"]);
    } else {
      if (this_element.multiple !== true) {
        _.each(this_element.options, (option) => {
            if (option.hasOwnProperty("default")) {
                delete option.default;
            }
        });
      }

      this_element.options[option_index].default = true;
    }
    this.setState({element: this_element});
    this.props.updateElement.call(this.props.preview, this_element);
  }
  updateOption() {
    let this_element = this.state.element;
    // to prevent ajax calls with no change
    if (this.state.dirty) {
      this.props.updateElement.call(this.props.preview, this_element);
      this.setState({dirty: false});
    }
  }
  addOption(index) {
    let this_element = this.state.element;
    this_element.options.splice(index+1,0,{value: '', label: '', key: ID.uuid()});
    this.props.updateElement.call(this.props.preview, this_element);
  }
  removeOption(index) {
    let this_element = this.state.element;
    this_element.options.splice(index,1);
    this.props.updateElement.call(this.props.preview, this_element);
  }
  render() {
    return (
      <div className="dynamic-option-list">
        <ul>
          <li>
            <div className="row">
              <div className="col-sm-8"><b>Options</b></div>
              <div className="col-sm-4"><b>Default</b></div>
            </div>
          </li>
          {
            this.props.element.options.map( (option, index) => {
              let this_key = 'edit_' + option.key;
              return (
                <li className="clearfix" key={this_key}>
                  <div className="row">
                    <div className="col-sm-8">
                      <input tabIndex={index+1} className="form-control" style={{width: '100%'}} type="text" name={'label_'+index} placeholder="Option Label" value={option.label} onBlur={this.updateOption.bind(this)} onChange={this.editOption.bind(this, index)} />
                    </div>
                    <div className="col-sm-1">
                      <input className="form-control" type="checkbox" value="1" onChange={this.editOptionDefault.bind(this, index)} checked={option.hasOwnProperty("default")} />
                    </div>
                    <div className="col-sm-3">
                      <div className="dynamic-options-actions-buttons">
                        <button onClick={this.addOption.bind(this, index)} className="btn btn-success"><i className="fa fa-plus-circle"></i></button>
                        { index > 0 &&
                          <button onClick={this.removeOption.bind(this, index)} className="btn btn-danger"><i className="fa fa-minus-circle"></i></button>
                        }
                      </div>
                    </div>
                  </div>
                </li>
              )
            })
          }
        </ul>
      </div>
    );
  }
}
