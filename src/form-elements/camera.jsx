import React from 'react';
import SortableItemMixin from 'react-sortable-items/SortableItemMixin';
import FormElementMixin from './util/form-element-mixin.jsx';

import HeaderBar from './util/header-bar.jsx';
import HeaderLabels from './util/header-labels.jsx';

export default React.createClass({
  mixins: [SortableItemMixin, FormElementMixin],

  statics: {
      toolbarEntry: function() {
        return {
          key: 'Camera',
          name: 'Camera',
          icon: 'fa fa-camera',
          label: 'Placeholder Label',
          field_name: 'camera_'
        };
      }
  },

  getInitialState() {
    return {img: null};
  },

  displayImage(e) {
    var self = this;
    var target = e.target;
    var file, reader;

    if(target.files && target.files.length) {
      file = target.files[0];
      reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = function() {
        self.setState({
          img: reader.result
        });
      }
    }
  },

  clearImage() {
    this.setState({
      img: null
    })
  },

  render() {
    return this.renderWithSortable(
      <div className="rfb-item">
        { !this.props.mutable &&
          <HeaderBar {...this.headerBarProps()} />
        }
        <div className="form-group">
          <HeaderLabels data={this.props.data} mutable={this.props.mutable} />
          <div className="image-upload-container">

            { !this.state.img &&
              <div>
                <input type="file" accept="image/*" capture="camera" className="image-upload" onChange={this.displayImage} />
                <div className="image-upload-control">
                  <div className="btn btn-default btn-school"><i className="fa fa-camera"></i> Upload Photo</div>
                  <p>Select an image from your computer or device.</p>
                </div>
              </div>
            }

            { this.state.img &&
              <div>
                <img src={ this.state.img } height="100" className="image-upload-preview" /><br />
                <div className="btn btn-school btn-image-clear" onClick={this.clearImage}>
                  <i className="fa fa-times"></i> Clear Photo
                </div>
              </div>
            }

          </div>
        </div>
      </div>
    );
  }
})
