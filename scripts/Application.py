from yaml import load, dump

try:
  from yaml import CLoader as Loader, CDumper as Dumper
except ImportError:
  from yaml import Loader, Dumper


class Application:
  def __init__(self):
    pass


class ApplicationInfo:
  def __init__(self):
    pass
    self.a = '1'
    self.sa = 1
    self.dd = [1, 2, 3, 4, '6\n7\n8\'\'\'\\\t\t\n']


if __name__ == '__main__':
  print('Application')

  a = load("""
version: 0.0.3
files:
  - url: IFNode-Setup-0.0.3.exe
    sha512: D3Y7D4zX2pTp00E3cBFhE/7dMPS3rY95cDxFFNBdZxYviAC7eqR3VxLm4l+bqbHI3pvUgSnrynGa/Gk8Dku1rQ==
    size: 75761813
path: IFNode-Setup-0.0.3.exe
sha512: D3Y7D4zX2pTp00E3cBFhE/7dMPS3rY95cDxFFNBdZxYviAC7eqR3VxLm4l+bqbHI3pvUgSnrynGa/Gk8Dku1rQ==
releaseDate: '2021-05-27T15:53:25.473Z'

  """, Loader=Loader)
  print(a)

  d = dump(ApplicationInfo(), Dumper=Dumper)
  print(d)
