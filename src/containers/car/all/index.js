import React, {Component} from 'react'
import PageHeaderWrapper from '../../../components/PageHeaderWrapper'
import {
    Drawer,
    Popconfirm,
    Card,
    Tooltip,
    Select,
    notification,
    Switch,
    Upload, Button, Icon
} from 'antd'
import Request from '../../../request'
import Color from 'color'
import moment from 'moment'
import _ from 'lodash'
import {connect} from 'react-redux'
//import styles from './styles.less'
import update from 'immutability-helper'

import {apiUrl} from '../../../settings'

// import { TableComp } from 'sz-react-utils'
import TableComp from '../../../components/_utils/table'
import {getPushPathWrapper, getUrlParams} from '../../../routes'
const Option = Select.Option
class AllCar extends Component {

    state = {
        visible: false, loading: false, disabled: true, uploadData: null, totalCar: '', allDealers: [],
        dealerId: ''
    }

    reload = () => {
        this.table.current.reload()
    }

    apiRequest = (params, columns, dealerId) => {
        return new Promise(async (resolve) => {
            let regExFilters = _.map(columns, x => x.key)
            console.log(dealerId, ' dealerId')
            if (!!dealerId) {
                params.dealerId = [dealerId]
            }
            if (this.state.dealerId) {
                params.dealerId = this.state.dealerId
            }
            let data = await Request.getAllCars({...params, regExFilters})
            this.setState({totalCar: data.total})
            resolve(data)
        })
    }

    deleteMakes = async ({_id}) => {

        this.setState({loading: true})

        await Request.deleteMake({_id})

        this.setState({loading: false})

        this.reload()

        notification.success({
            message: 'Deleted Successfully',
            duration: 20,
            key: `${_id}-close`
        })

    }

    constructor(props) {
        super(props)
        this.table = React.createRef()
    }


    async componentWillMount() {

        let data = await getUrlParams('cars.dealercars', this.props.pathname)
        if (data && data.id) {
            this.setState({
                dealerId: data.id
            }, () => {
                this.reload()
            })
        }

        let {data: allDealers} = await Request.getAllDealers({count: 10000})
        this.setState({
            allDealers
        })
    }


    render() {
        const {dispatch} = this.props
        const {visible, disabled, loading, dealerId, allDealers} = this.state
        const columns = [
            {
                title: 'CarName',
                key: 'make.name',
                sorter: true,
                dataIndex: 'make.name',
                searchTextName: 'make',
                filterRegex: true,
                fixed: 'left'
            },
            {
                title: 'CarModel',
                key: 'model.name',
                sorter: true,
                dataIndex: 'model.name',
                searchTextName: 'model',
                filterRegex: true
            },
            {
                title: 'FuelType',
                key: 'fuelType.name',
                sorter: true,
                dataIndex: 'fuelType.name',
                searchTextName: 'fuel',
                filterRegex: true
            }, {
                title: 'Variant',
                key: 'variant',
                sorter: true,
                dataIndex: 'variant.name',
                searchTextName: 'variant',
                filterRegex: true
            },
            {
                title: 'DealerName',
                key: 'name',
                sorter: true,
                dataIndex: 'dealerId',
                searchTextName: 'name',
                filterRegex: true,
                render: (val, record) => {
                    return (<div>{record.dealerId ? record.dealerId.dealershipName : ''}</div>)

                }
            },

            {
                title: 'Price',
                key: 'price',
                sorter: true,
                dataIndex: 'price',
                searchTextName: 'price',
                filterRegex: true
            },
            {
                title: 'RegNo',
                key: 'regNo',
                sorter: true,
                dataIndex: 'regNo',
                searchTextName: 'regNo',
                filterRegex: true
            },
            {
                title: 'ManufactureYear',
                key: 'manufactureYear',
                sorter: true,
                dataIndex: 'manufactureYear',
                searchTextName: 'manufactureYear',
                filterRegex: true
            },
            {
                title: 'Km',
                key: 'km',
                sorter: true,
                dataIndex: 'km',
                searchTextName: 'km',
                filterRegex: true
            },
            {
                title: 'Created_At',
                key: 'createdAt',
                sorter: true,
                dataIndex: 'createdAt',
                searchTextName: 'createdDate',
                filterRegex: true,
                render: (val, record) => {
                    return (<div>{record.createdAt ? moment(record.createdAt).format('DD-MMM-YYYY') : ''}</div>)
                }
            },
            {
                key: 'actions',
                title: 'Actions',
                width: 100,
                fixed: 'right',
                render: (val) => {
                    return <div>

                        <Tooltip title="Edit Details">
                            <Button shape="circle" onClick={() => {
                                dispatch(getPushPathWrapper('cars.editMake', {id: val._id}))
                            }} icon="edit"/>
                        </Tooltip>

                        <Tooltip title="Edit Details">
                            <Popconfirm title="Are you sure delete this task?" onConfirm={() => {
                                this.deleteMakes(val)
                            }} onCancel={() => {
                                console.log()
                            }} okText="Yes" cancelText="No">
                                <Button type="danger" shape="circle" icon="delete"/>
                            </Popconfirm>

                        </Tooltip>
                    </div>

                }
            }
        ]


        return (
            <PageHeaderWrapper
                title={`All Cars : ${this.state.totalCar}`}>

                <Card style={{marginBottom: 10}}>

                    <h5>SEARCH BY DEALER</h5>
                    <Select
                        showSearch
                        allowClear
                        style={{width: 200}}
                        value={this.state.dealerId}
                        placeholder='Select Dealer'
                        onChange={(dealer) => {
                            this.setState({dealerId: dealer.toString()}, () => {

                                this.table.current.reload()

                            })
                        }}

                        filterOption={(input, option) => {
                            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }}
                    >
                        {
                            allDealers.map((val, idn) => {
                                return (
                                    <Option key={idn} value={val._id}>{val.dealershipName}</Option>
                                )
                            })
                        }

                    </Select>


                </Card>

                <Card bordered={true}>
                    <TableComp ref={this.table} columns={columns} extraProps={{loading, scroll: {x: 1000}}}
                               apiRequest={(params) => this.apiRequest(params, columns, dealerId)}/>
                </Card>

            </PageHeaderWrapper>)

    }

}


const mapStateToProps = ({global, router}) => ({
    categories: global.categories,
    pathname: router.location.pathname,

})
const mapDispatchToProps = dispatch => {
    return {
        dispatch
    }
}


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AllCar)
