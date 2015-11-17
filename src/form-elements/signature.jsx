import React from 'react';
import ReactDOM from 'react-dom';
import SortableItemMixin from 'react-sortable-items/SortableItemMixin';
import FormElementMixin from './util/form-element-mixin.jsx';
import SignaturePad from 'react-signature-pad';

import HeaderBar from './util/header-bar.jsx';
import HeaderLabels from './util/header-labels.jsx';

export default React.createClass({
  mixins: [SortableItemMixin, FormElementMixin],
  statics: {
      toolbarEntry: function() {
        return {
          element: 'Signature',
          displayName: 'Signature',
          icon: 'fa fa-pencil-square-o',
          label: 'Signature'
        };
      }
  },
  validate() {
      let $canvas_sig = this.refs["canvas_"+item.name];
      let base64 = $canvas_sig.toDataURL().replace('data:image/png;base64,', '');
      let isEmpty = $canvas_sig.isEmpty();
      let $input_sig = ReactDOM.findDOMNode(this.refs["child_ref_"+item.name]);
      if (isEmpty) {
        $input_sig.value = "";
      } else {
        $input_sig.value = base64;
      }
      return true;
  },
  componentDidMount() {
    if (this.props.defaultValue !== undefined && this.props.defaultValue.length > 0) {
      let canvas = this.refs['canvas_'+this.props.data.name];
      canvas.fromDataURL('data:image/png;base64,' + this.props.defaultValue);
    }
  },
  render() {
    let props = {};
    props.type = "hidden";
    props.name = this.props.data.name;

    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = "child_ref_" + this.props.data.name;
    }
    let pad_props = {};
    pad_props.clearButton = {true};
    if (this.props.mutable) {
      pad_props.defaultValue = this.props.defaultValue;
      pad_props.ref = 'canvas_'+this.props.data.name;
    }
    return this.renderWithSortable(
      <div className="rfb-item">
        { !this.props.mutable &&
          <HeaderBar {...this.headerBarProps()} />
        }
        <div className="form-group">
          <HeaderLabels data={this.props.data} mutable={this.props.mutable} />
          <SignaturePad {...pad_props} />
          <input {...props} />
        </div>
      </div>
    );
  }
})
