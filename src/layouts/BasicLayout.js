import React, { Suspense } from 'react'
import { Layout } from 'antd'
import DocumentTitle from 'react-document-title'
import isEqual from 'lodash/isEqual'
import memoizeOne from 'memoize-one'
import { connect } from 'react-redux'
import { ContainerQuery } from 'react-container-query'
import classNames from 'classnames'
import pathToRegexp from 'path-to-regexp'
import Media from 'react-media'

// import Authorized from '@/utils/Authorized';
import logo from '../assets/logo.svg'
// import Footer from './Footer';
import Header from './Header'
import Context from './MenuContext'
// import Exception403 from '../pages/Exception/403';
// import PageLoading from '@/components/PageLoading';
import SiderMenu from '../components/SiderMenu'

import styles from './BasicLayout.less'
import { bindActionCreators } from 'redux'

const { Content } = Layout

const query = {
  'screen-xs': {
    maxWidth: 575
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599
  },
  'screen-xxl': {
    minWidth: 1600
  }
}

class BasicLayout extends React.PureComponent {
  constructor (props) {
    super(props)
    this.getPageTitle = memoizeOne(this.getPageTitle)
    this.matchParamsPath = memoizeOne(this.matchParamsPath, isEqual)
  }

  componentDidMount () {
    const {
      dispatch
    } = this.props

    // dispatch({
    //   type: 'setting/getSetting'
    // })

    // dispatch({
    //   type: 'menu/getMenuData',
    //   payload: { routes, authority }
    // })
  }

  componentDidUpdate (preProps) {
    const { collapsed, isMobile } = this.props

    if (isMobile && !preProps.isMobile && !collapsed) {
      this.handleMenuCollapse(false)
    }
  }

  getContext () {
    const { location, breadcrumbNameMap } = this.props
    return {
      location,
      breadcrumbNameMap
    }
  }

  matchParamsPath = (pathname, breadcrumbNameMap) => {
    const pathKey = Object.keys(breadcrumbNameMap).find(key => pathToRegexp(key).test(pathname))
    return breadcrumbNameMap[pathKey]
  }

  getPageTitle = (pathname, breadcrumbNameMap) => {
    const currRouterData = this.matchParamsPath(pathname, breadcrumbNameMap)

    if (!currRouterData) {
      return 'Ant Design Pro'
    }
    // const pageName = formatMessage({
    //   id: currRouterData.locale || currRouterData.name,
    //   defaultMessage: currRouterData.name,
    // });

    const pageName = 'Some Page nmae'
    return `${pageName} - Ant Design Pro`
  }

  getLayoutStyle = () => {
    const { fixSiderbar, isMobile, collapsed, layout } = this.props
    if (fixSiderbar && layout !== 'topmenu' && !isMobile) {
      return {
        paddingLeft: collapsed ? '80px' : '256px'
      }
    }
    return null
  }

  handleMenuCollapse = collapsed => {
    this.props.dispatch({
      type: 'TOGGLE_SIDEBAR_COLLAPSED'
    })
  }

  render () {
    const {
      navTheme,
      layout: PropsLayout,
      children,
      location: { pathname },
      isMobile,
      menuData,
      breadcrumbNameMap,
      fixedHeader
    } = this.props


    const isTop = PropsLayout === 'topmenu'
    const contentStyle = !fixedHeader ? { paddingTop: 0 } : {}

    const layout = (
      <Layout>
        {isTop && !isMobile ? null : (
          <SiderMenu
            {...this.props}
            logo={logo}
            theme={navTheme}
            onCollapse={this.handleMenuCollapse}
            menuData={menuData}
            isMobile={isMobile}
          />
        )}
        <Layout
          style={{
            ...this.getLayoutStyle(),
            minHeight: '100vh'
          }}
        >

          <Header
            menuData={menuData}
            handleMenuCollapse={this.handleMenuCollapse}
            logo={logo}
            isMobile={isMobile}
            {...this.props}
          />

          {/*

        <Header
            menuData={menuData}
            handleMenuCollapse={this.handleMenuCollapse}
            logo={logo}
            isMobile={isMobile}
            {...this.props}
          />
          <Footer />*/}
        </Layout>
      </Layout>
    )
    return (
      <React.Fragment>
        <DocumentTitle title={'Some title here asdfasdf'}>
          <ContainerQuery query={query}>
            {params => (
              <Context.Provider value={this.getContext()}>
                <div className={classNames(params)}>{layout}</div>
              </Context.Provider>
            )}
          </ContainerQuery>
        </DocumentTitle>
      </React.Fragment>
    )
  }
}

const mapStateToProps = ({ theme }) => {
  return ({
    collapsed: theme.collapsed,
    layout: theme.layout,
    theme: theme.theme,
    navTheme: theme.navTheme,
    fixSiderbar: theme.fixSiderbar,
    breadcrumbNameMap: theme.breadcrumbNameMap
  })
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    dispatch
  )

export default connect(mapStateToProps, null)(props => {
  return (
    <Media query="(max-width: 599px)">
      {isMobile => <BasicLayout {...props} isMobile={isMobile}/>}
    </Media>
  )
})
