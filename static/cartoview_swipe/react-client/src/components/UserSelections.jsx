import React,{ Component } from 'react';
export default class UserSelections extends Component { 

  render() {
    return (
      <div className={'selections-box'}>
        {this.props.selections.map((s, i) => {
          return (
            <div key={i} className={'selection'}>
              <span>{`${s.title}: `}</span>   
              <a href={s.layer.detail_url} target={'_blank'}>{s.layer.title}</a>  
            </div>
          )
        })}
      </div>
    )
  }
}