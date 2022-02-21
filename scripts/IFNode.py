from interactionfreepy import IFBroker, IFWorker
from LibSync import LibSync
import sys
import threading
from datetime import datetime, timedelta
import time
from NTP import NTPSyncer

class IFNode:
  def __init__(self):
    self.inited = False

  def init(self, serverRootURL,localRootPath):
    if self.inited:raise RuntimeError('Already inited.')
    IFWorker('tcp://localhost:{}'.format(localPort), 'LibSync', LibSync(serverRootURL, localRootPath))
    self.inited=True

  def test(self, a):
    return 'IFNodePy: ' + a

def startTimeSyncLoop():
  s = NTPSyncer('172.16.60.200')
  threading.Thread(target=lambda: s.lock(60, 120), daemon=True).start()
  return s
  # while True:
  #   time.sleep(1)
  #   print('hahaha')
  #   f= open('D:\\test.txt', 'a')
  #   f.write('hahaha\n')
  #   f.flush()

if __name__ == '__main__':
  print('start')
  localPort = 224
  broker = IFBroker('tcp://*:{}'.format(localPort))
  broker.startWebSocket(82, '/ws/')

  # serverRootURL ='http://172.16.60.200/IFAssets/IFNodeApplications/'
  # localRootPath ='C:\\Users\\Administrator\\Downloads\\LibSyncTest\\'
  serverRootURL = sys.stdin.readline().strip()
  localRootPath = sys.stdin.readline().strip()

  IFWorker('tcp://localhost:{}'.format(localPort), 'IFNodePy', IFNode())
  IFWorker('tcp://localhost:{}'.format(localPort), 'LibSync', LibSync(serverRootURL, localRootPath))
  IFWorker('tcp://localhost:{}'.format(localPort), 'TimeSync', startTimeSyncLoop())

  while True:
    l = sys.stdin.readline()
    if (l == None or l == -1 or len(l) == 0):
      sys.exit(0)
