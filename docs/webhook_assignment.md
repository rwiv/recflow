## concept

- webhook prefix
    - main, sub, extra
    - main, extra는 항상 존재.
- channel categories
    - `allowedChannels`
        - 무조건 main webhook에 할당될 channels
    - `extraChannels`
        - 무조건 extra webhook에 할당될 channels
    - `unclassifiedChannels`
        - `allowedChannels`도 아니고 `extraChannels`도 아닌 channels



## modes

- mode1
    - main webhook
        - `allowedChannels` + `unclassifiedChannels` + `extraChannels`
    - extra webhook
        - main webhook에 할당되어야하나 자리가 꽉 찼을 때 extra webhook에 할당
- mode2
    - main webhook
        - `allowedChannels` + `unclassifiedChannels`
    - extra webhook
        - `extraChannels`
        - main webhook에 할당되어야하나 자리가 꽉 찼을 때
- mode3
    - main webhook
        - `allowedChannels` + `unclassifiedChannels`
    - sub webhook
        - main webhook에 할당되어야하나 자리가 꽉 찼을 때
    - extra webhook
        - `extraChannels`
        - sub webhook에 할당되어야하나 자리가 꽉 찼을 때
- mode4
    - main webhook
        - `allowedChannels`
    - sub webhook
        - `unclassifiedChannels`
        - main webhook에 할당되어야하나 자리가 꽉 찼을 때
    - extra webhook
        - `extraChannels`
        - sub webhook에 할당되어야하나 자리가 꽉 찼을 때
