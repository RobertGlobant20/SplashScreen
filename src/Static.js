import React from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { warningIcon, checkMarkIcon } from './encodedImages';

import './Static.css';

const importStatusEnum = {
  none: 1,
  error: 2,
  success: 3,
};

let checked = false;

class Static extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      importStatus: importStatusEnum.none,
      errorDescription: 'Something went wrong when importing your custom setting file. Please try again or proceed with default settings.',
      signInTitle: this.props.signInStatus ? this.props.signOutTitle : this.props.signInTitle,
      signInTooltip: this.props.signInStatus ? this.props.signOutTooltip : this.props.signInTooltip,
      signInStatus: this.props.signInStatus,
      loadingTime: 'Total loading time: ',
      importSettingsTitle: this.props.importSettingsTitle
    };

    window.setImportStatus = this.setImportStatus.bind(this);
    window.setTotalLoadingTime = this.setTotalLoadingTime.bind(this);
    window.setEnableSignInButton = this.setEnableSignInButton.bind(this);
    window.handleSignInStateChange = this.handleSignInStateChange.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  render() {
    return (
      <Container className='pr-3'>
        <Row className='mt-3'>
          <button className='secondaryButton' onClick={this.launchDynamo} tabIndex={1}>
            {this.props.launchTitle}
          </button>
        </Row>

        <Row className='mt-3'>
          <OverlayTrigger placement='right' overlay={
            <Tooltip>{this.state.signInTooltip}</Tooltip>
          }>
            <button id='btnSignIn' className='primaryButton' onClick={this.signIn} tabIndex={2} >
              {this.state.signInTitle}
            </button>
          </OverlayTrigger>
        </Row>

        <Row className='mt-3'>
          <OverlayTrigger
            placement={'right'}
            overlay={
              <Tooltip
                hidden={this.state.importStatus === importStatusEnum.success}
                id='button-tooltip'>
                {this.state.importStatus == importStatusEnum.error ? this.state.errorDescription : this.props.importSettingsTooltipDescription}
              </Tooltip>
            }>
            <label id='lblImportSettings' className='primaryButton px-1' tabIndex={3}>
              <input
                id='inputImportSettings'
                type='file'
                className='primaryButton'
                accept='.xml'
                onChange={(e) => this.readFile(e)}
              />
              <div className='buttonLabel'>
                <img
                  src={warningIcon}
                  alt=''
                  hidden={this.state.importStatus !== importStatusEnum.error}></img>
                <img
                  src={checkMarkIcon}
                  alt=''
                  hidden={this.state.importStatus !== importStatusEnum.success}></img>
                <div className='importSettingsText'>
                  <span>{this.props.importSettingsTitle}</span>
                </div>
              </div>
            </label>
          </OverlayTrigger>
        </Row>

        <Row className='mt-3'>
          <label className='p-0 checkboxShowScreenAgain '>
            <input
              type='checkbox'
              onChange={this.handleChange}
              className='checkBoxStyle'
              tabIndex={4} />
            <span className='checkmark'>
              {' '}
              {this.props.showScreenAgainLabel}{' '}
            </span>
          </label>
        </Row>

        <Row className='mt-3'>
          <div className='p-0 loadingTimeFooter' >
            {this.state.loadingTime}
          </div>
        </Row>
      </Container>
    );
  }

  //Opens a page to signin
  signIn = async () => {
    if (chrome.webview !== undefined) {
      if (this.state.signInStatus) {
        let status = await chrome.webview.hostObjects.scriptObject.SignOut();
        this.setState({
          signInStatus: !status,
          signInTitle: this.props.signInTitle
        });
      }
      else {
        let btn = document.getElementById('btnSignIn');
        btn.classList.add('disableButton');
        btn.disabled = true;

        this.setState({ signInTitle: this.props.signingInTitle });
        let status = await chrome.webview.hostObjects.scriptObject.SignIn();
        this.setState({ signInStatus: status });

        btn.classList.remove('disableButton');
        btn.disabled = false;
        if (status) {
          this.setState({ signInTitle: this.props.signOutTitle });
        }
        else {
          this.setState({ signInTitle: this.props.signInTitle });
        }
      }
    }
  };

  //This method calls another method from Dynamo to actually launch it
  launchDynamo() {
    if (chrome.webview !== undefined) {
      //The 'checked' is a boolean that represents if the user don't want to show the Static screen again
      chrome.webview.hostObjects.scriptObject.LaunchDynamo(checked);
    }
  }

  //Reads the file and send the string to a method inside Dynamo called 'ImportSettings'
  readFile(event) {
    let file = event.target.files[0];
    if (file) {
      let fr = new FileReader();
      fr.onload = function () {
        if (chrome.webview !== undefined) {
          chrome.webview.hostObjects.scriptObject.ImportSettings(fr.result);
        }
      };

      fr.readAsText(file);
    }
  }

  //Set the result of the file that was imported by Dynamo
  setImportStatus(importStatus) {
    this.setState({
      importStatus: importStatus.status,
      importSettingsTitle: importStatus.importSettingsTitle,
      errorDescription: importStatus.errorDescription,
    });
  }

  setTotalLoadingTime(loadingTime) {
    this.setState({
      loadingTime: loadingTime
    });
  }

  setEnableSignInButton(enableSignInButton) {
    let btn = document.getElementById('btnSignIn');

    if (enableSignInButton.enable === 'True') {
      btn.classList.remove('disableButton');
      btn.disabled = false;
    } else {
      btn.classList.add('disableButton');
      btn.disabled = true;
    }
  }

  //Handles changes to auth status on splash screen
  handleSignInStateChange(auth) {
    let btn = document.getElementById('btnSignIn');

    this.setState({
      signInStatus: auth.status === 'True'
    });

    if (auth.status === 'True') {
      btn.innerHTML = this.props.signOutTitle;
    } else {
      btn.innerHTML = this.props.signInTitle;
    }
  }

  //Every time the checkbox is clicked, this method is called
  handleChange() {
    checked = !checked;
  }

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // We check explicitly the lblImportSettings control due to it's a label that wraps inputs, it's no necessary for the launch and signing buttons because they receive the focus ready to are hit with the Enter key
      if (document.activeElement.id === 'lblImportSettings') {
        document.getElementById('inputImportSettings').click();
      }
    }
  };
}

Static.defaultProps = {
  signInTitle: 'Sign In',
  signInTooltip: 'Sign in to access online services that integrate with your desktop software.',
  signingInTitle: 'Signing In',
  signOutTitle: 'Sign Out',
  signOutTooltip: 'Signing out of Dynamo will sign you out of all Autodesk desktop products.',
  launchTitle: 'Launch Dynamo',
  showScreenAgainLabel: 'Don\'t show this screen again',
  importSettingsTitle: 'Import Settings',
  importSettingsTooltipDescription: 'You can import custom settings here, which will overwrite your current settings. If you\'d like to preserve a copy of your current settings, export them before importing new settings. Settings not shown in the Preferences panel will be applied once Dynamo and any host program restarts.'
};

Static.propTypes = {
  signInTitle: PropTypes.string,
  signInTooltip: PropTypes.string,
  signingInTitle: PropTypes.string,
  signOutTitle: PropTypes.string,
  signOutTooltip: PropTypes.string,
  launchTitle: PropTypes.string,
  showScreenAgainLabel: PropTypes.string,
  signInStatus: PropTypes.bool,
  importSettingsTitle: PropTypes.string,
  importSettingsTooltipDescription: PropTypes.string
};

export default Static;
