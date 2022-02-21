from yaml import load, dump
import requests
import os
import urllib
import threading
from queue import Queue
import asyncio

try:
  from yaml import CLoader as Loader, CDumper as Dumper
except ImportError:
  from yaml import Loader, Dumper


class LibSync:
  def __init__(self, serverRootURL, localRootPath):
    self.serverRootURL = serverRootURL
    self.localRootPath = localRootPath
    self.serverSummary = {'files': []}
    self.localSummary = {'files': [], 'version': '0.0.0'}
    self.differentials = []
    self.__operations = Queue()
    threading.Thread(target=self.__loop, daemon=True).start()

  def __loop(self):
    while True:
      operation = self.__operations.get()
      for o in operation:
        o()

  async def updateSummaries(self):
    future = asyncio.Future()
    self.__operations.put([self.doUpdateSummaries, lambda: future.set_result(None)])
    await future

  def doUpdateSummaries(self):
    self.serverSummary = load(requests.get(self.serverRootURL + 'summary.yml').content, Loader=Loader)
    localSummaryPath = os.path.join(self.localRootPath, 'summary.yml')
    if os.path.exists(localSummaryPath):
      file = open(localSummaryPath)
      self.localSummary = load(file.read(), Loader=Loader)
      file.close()

    def fileMap(fs):
      fs = fs['files']
      fm = {}
      for f in fs:
        fm[f['url']] = f
      return fm

    serverFileMap = fileMap(self.serverSummary)
    localFileMap = fileMap(self.localSummary)
    actions = []

    for serverFile in serverFileMap:
      if (localFileMap.__contains__(serverFile)):
        if not (serverFileMap[serverFile]['sha512'] == localFileMap[serverFile]['sha512']):
          actions.append(['download', serverFile])
      else:
        actions.append(['download', serverFile])

    for localFile in localFileMap:
      if not serverFileMap.__contains__(localFile):
        actions.append(['remove', localFile])

    self.differentials = actions

  def getLocalVersion(self):
    return self.localSummary['version']

  def isUptodate(self):
    return len(self.differentials) == 0

  async def performSync(self):
    future = asyncio.Future()
    self.__operations.put([self.doPerformSync, lambda: future.set_result(None)])
    await future

  def doPerformSync(self):
    for action in self.differentials:
      url = urllib.parse.urljoin(self.serverRootURL, action[1])
      data = requests.get(url).content
      localPath = os.path.join(self.localRootPath, action[1])
      os.makedirs(os.path.dirname(localPath), exist_ok=True)
      file = open(localPath, 'wb')
      file.write(data)
      file.close()

    file = open(os.path.join(self.localRootPath, 'summary.yml'), 'w')
    file.write(dump(self.serverSummary))
    file.close()
    self.localSummary = self.serverSummary
    self.differentials = []


if __name__ == '__main__':
  sync = LibSync('http://172.16.60.200/IFAssets/IFNodeApplications/', 'C:\\Users\\Administrator\\Downloads\\LibSyncTest\\')
  sync.doUpdateSummaries()
  sync.doPerformSync()
