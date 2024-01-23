import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Dynamic from './Dynamic';
import Static from './Static';
import { base64DynamoLogo, base64DynamoBackground } from './encodedImages';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends React.Component {
  constructor() {
    super();
    this.setBackgroundImage();
    this.state = {
      isChecked: false,
      welcomeToDynamoTitle: 'Welcome to Dynamo!',
      loadingDone: false,
      signInStatus: false
    };

    //This is a reference to the DOM of the project that will be called in Dynamo to set the title of the splash screen (Defined by 'Welcome to Dynamo!' by default)
    window.setLabels = this.setLabels.bind(this);
    window.setLoadingDone = this.setLoadingDone.bind(this);
    window.setSignInStatus = this.setSignInStatus.bind(this);
    this.handleCheckedChange = this.handleCheckedChange.bind(this);
    this.closeDynamo = this.closeDynamo.bind(this);
  }

  handleCheckedChange = (checked) => {
    this.setState({isChecked: checked});
  };

  setBackgroundImage() {
    let backgroundImage = '#base64BackgroundImage';
    if (!backgroundImage.includes('#'))
      // eslint-disable-next-line no-import-assign
      base64DynamoBackground = backgroundImage;
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    //TODO : As alternative we can receive the event from the Childs like the Static component
  }

  handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (this.state.loadingDone) {
        this.closeDynamo();
      }
    }
  };

  render() {
    return (
      <Container fluid>
        <Row>
          <Col className='menuOptions px-4' >
            <Row className='bottomMenu'>
              <Col>
                <Row>
                  <div>
                    <img className='dynamoLogo' alt='' src={base64DynamoLogo}></img>
                  </div>
                </Row>
                <Row className='welcomeRow'>
                  <div >
                    {this.state.welcomeToDynamoTitle}
                  </div>
                </Row>
              </Col>
            </Row>
            <Row className='bottomMenu'>
              <Col>
                {
                  this.state.loadingDone ?
                    <Static
                      signInStatus={this.state.signInStatus}
                      signInTitle={this.state.signInTitle}
                      signInToolTip={this.state.signInToolTip}
                      signingInTitle={this.state.signingInTitle}
                      signOutTitle={this.state.signOutTitle}
                      signOutToolTip={this.state.signInToolTip}
                      welcomeToDynamoTitle={this.state.welcomeToDynamoTitle}
                      launchTitle={this.state.launchTitle}
                      showScreenAgainLabel={this.state.showScreenAgainLabel}
                      importSettingsTitle={this.state.importSettingsTitle}
                      importSettingsTooltipDescription={this.state.importSettingsTooltipDescription}
                      onCheckedChange={this.handleCheckedChange}
                    /> : <Dynamic />
                }
              </Col>
            </Row>
          </Col>
          <Col className='p-0' >
            {this.state.loadingDone && <span onClick={this.closeDynamo} className='close' />}
            <img className='screenBackground' alt='' src={base64DynamoBackground}></img>
          </Col>
        </Row>
      </Container>
    );
  }

  //This method sets the labels of the splash screen as an option of localization
  setLabels(labels) {
    this.setState({
      welcomeToDynamoTitle: labels.welcomeToDynamoTitle,
      launchTitle: labels.launchTitle,
      showScreenAgainLabel: labels.showScreenAgainLabel,
      importSettingsTitle: labels.importSettingsTitle,
      importSettingsTooltipDescription: labels.importSettingsTooltipDescription,
      signInTitle: labels.signInTitle,
      signInToolTip: labels.signInToolTip,
      signingInTitle: labels.signingInTitle,
      signOutTitle: labels.signOutTitle,
      signOutToolTip: labels.signOutToolTip
    });
  }

  //Set the login status from Dynamo
  setSignInStatus(val) {
    this.setState({
      signInStatus: val.signInStatus === 'True'
    });
  }

  //This method is called when the loading is done from Dynamo side
  setLoadingDone = async () => {
    this.setState({
      loadingDone: true
    });
  };

  closeDynamo() {
    if (chrome.webview !== undefined) {
      chrome.webview.hostObjects.scriptObject.CloseWindowPreserve(this.state.isChecked);
    }
  }
}

export default App;
