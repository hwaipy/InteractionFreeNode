import React from 'react';
import {
  BsFillCollectionPlayFill,
  BsFillXDiamondFill,
  BsGearFill,
} from 'react-icons/bs';
import { GrSettingsOption, GrCloudDownload } from 'react-icons/gr';
import { ImCloudDownload, ImCloudCheck } from 'react-icons/im';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import GTab from './components/GTab';
import InstancePane from './app/InstancePane';
// import ApplicationPane from './app/ApplicationPane';
// import PreferencePane from './app/PreferencePane';
import IFWorker from './interactionfree';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.navWidth = 64;
    this.iconSize = this.navWidth * 0.5;
    this.running = true;
    this.state = {
      isCodeUptodate: true,
    };
    this.worker = IFWorker('ws://127.0.0.1:82/ws/');
    this.periodLoop(async () => {
      this.setState({
        isCodeUptodate: await this.worker.LibSync.isUptodate(),
      });
    }, 500);
    this.periodLoop(async () => {
      await this.worker.LibSync.updateSummaries();
    }, 60000);
    this.periodLoop(async () => {
      this.setState({
        timeSyncOffset: await this.worker.TimeSync.getOffset(),
        timeSyncHavingError: await this.worker.TimeSync.isHavingError(),
      });
    }, 500);
  }

  async onClickCheckCodeUpdate() {
    this.worker.LibSync.updateSummaries();
  }

  async onClickPerformCodeUpdate() {
    this.worker.LibSync.performSync();
  }

  componentDidMount() {}

  componentWillUnmount() {
    this.running = false;
  }

  periodLoop(f, period) {
    setTimeout(async () => {
      while (this.running) {
        f();
        await new Promise((r) => setTimeout(r, period));
      }
    }, 0);
  }

  render() {
    return (
      <div>
        <GTab navWidth={this.navWidth}>
          <GTab
            icon={<BsFillCollectionPlayFill size={this.iconSize} />}
            content={<InstancePane />}
          ></GTab>
          <GTab
            icon={<BsFillXDiamondFill size={this.iconSize} />}
            content={<div>2</div>}
            // content={<ApplicationPane />}
          ></GTab>
          <GTab
            icon={<BsGearFill size={this.iconSize} />}
            content={<div>3</div>}
            // content={<PreferencePane />}
          ></GTab>
        </GTab>
        <div className={'applicationUpdate'}>
          {this.state.isCodeUptodate ? (
            <ImCloudCheck
              size={24}
              className={'UpdateToDateIcon'}
              onClick={this.onClickCheckCodeUpdate.bind(this)}
            />
          ) : (
            <ImCloudDownload
              size={24}
              className={'NeedUpdateIcon'}
              onClick={this.onClickPerformCodeUpdate.bind(this)}
            />
          )}
        </div>
        <div className={'timeSync'}>
          <p>{this.state.timeSyncHavingError ? 'Error' : parseInt(this.state.timeSyncOffset * 1000) + ' ms'}</p>
        </div>
      </div>
    );
  }
}

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Main} />
      </Switch>
    </Router>
  );
}
