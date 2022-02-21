from yaml import load, dump
import os
import re
import hashlib
import datetime
import shutil

try:
  from yaml import CLoader as Loader, CDumper as Dumper
except ImportError:
  from yaml import Loader, Dumper

serverRoot = 'Z:\\web\\IFAssets\\IFNodeApplications\\'
mappings = [
  ['D:\\CodeServer\\InteractionFree\\InteractionFree\\InteractionFreeLocal\\', 'Lib\\Python\\'],
]
ignores = [
  '/.idea/',
  '/.metals/',
  '/.vscode/',
  '/__pycache__/',
]
version = '0.1'


class FileMapping:
  ignorePatterns = [re.compile(i) for i in ignores]

  def __init__(self, sourceFile, targetFile):
    self.sourceFile = sourceFile
    self.targetFile = targetFile
    self.ignore = self.__checkIgnore()
    if not self.ignore: self.__prepare()

  def __checkIgnore(self):
    for p in FileMapping.ignorePatterns:
      if (p.search(self.sourceFile)): return True
    return False

  def __prepare(self):
    f = open(self.sourceFile, 'rb')
    bs = f.read()
    f.close()
    self.hash = hashlib.sha512(bs).hexdigest()
    self.fileLength = len(bs)

  def __repr__(self):
    return 'M: {}  {}'.format(self.sourceFile, self.targetFile)


def prepareFileMappings():
  fileMappings = []
  for mapping in mappings:
    source = mapping[0]
    target = mapping[1]

    for path, dir_list, file_list in os.walk(source):
      targetPath = os.path.join(target, os.path.relpath(path, source))
      for file in file_list:
        sourceFile = os.path.join(path, file).replace('\\.\\', '\\').replace('\\', '/')
        targetFile = os.path.join(targetPath, file).replace('\\.\\', '\\').replace('\\', '/')
        fileMappings.append(FileMapping(sourceFile, targetFile))

  fileMappings = [fm for fm in fileMappings if not fm.ignore]
  return fileMappings


def prepareSourceFileStructure(fileMappings):
  mappings = []
  for fm in fileMappings:
    mappings.append({
      'url': fm.targetFile,
      'size': fm.fileLength,
      'sha512': fm.hash
    })
  date = datetime.datetime.now()
  return {
    'files': mappings,
    'releaseDate': date.isoformat(),
    'version': '{}.{}'.format(version, f'{date:%Y%m%d%H%M%S}')
  }


def loadTargetFileStructure(file):
  if not os.path.exists(file):
    return {
      'files': []
    }
  f = open(file, 'r')
  yml = f.read()
  f.close()
  return load(yml, Loader=Loader)


def differential(fileMappings, sourceFileStructure, targetFileStructure):
  def fileMap(fs):
    fs = fs['files']
    fm = {}
    for f in fs:
      fm[f['url']] = f
    return fm

  sourceFileMap = fileMap(sourceFileStructure)
  targetFileMap = fileMap(targetFileStructure)

  actions = []

  for fileMapping in fileMappings:
    url = fileMapping.targetFile
    if (targetFileMap.__contains__(url)):
      if not (sourceFileMap[url]['sha512'] == targetFileMap[url]['sha512']):
        actions.append(['upload', fileMapping])
    else:
      actions.append(['upload', fileMapping])

  for file in targetFileMap:
    if not sourceFileMap.__contains__(file):
      actions.append(['remove', file])

  return actions


def performFiles(actions):
  for action in actions:
    if action[0] == 'upload':
      targetPath = os.path.join(serverRoot, action[1].targetFile)
      os.makedirs(os.path.dirname(targetPath), exist_ok=True)
      shutil.copy(action[1].sourceFile, targetPath)
    if action[0] == 'remove':
      os.remove(os.path.join(serverRoot, action[1]))


def performSummary(summary):
  bytes = dump(summary)
  f = open(os.path.join(serverRoot, 'summary.yml'), 'w')
  f.write(bytes)
  f.close()


if __name__ == '__main__':
  fileMappings = prepareFileMappings()
  sourceFileStructure = prepareSourceFileStructure(fileMappings)
  targetFileStructure = loadTargetFileStructure(os.path.join(serverRoot, 'summary.yml'))
  actions = differential(fileMappings, sourceFileStructure, targetFileStructure)
  performFiles(actions)
  performSummary(sourceFileStructure)
