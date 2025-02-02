## concept

- node priority
    - main, sub, extra
    - main, extra는 항상 존재.
- channel categories
    - `allowedChannels`
        - 무조건 main node에 할당될 channels
    - `extraChannels`
        - 무조건 extra node에 할당될 channels
    - `unclassifiedChannels`
        - `allowedChannels`도 아니고 `extraChannels`도 아닌 channels



## modes

- mode1
    - main node
        - `allowedChannels` + `unclassifiedChannels` + `extraChannels`
    - extra node
        - main node에 할당되어야하나 자리가 꽉 찼을 때 extra node에 할당
- mode2
    - main node
        - `allowedChannels` + `unclassifiedChannels`
    - extra node
        - `extraChannels`
        - main node에 할당되어야하나 자리가 꽉 찼을 때
- mode3
    - main node
        - `allowedChannels` + `unclassifiedChannels`
    - sub node
        - main node에 할당되어야하나 자리가 꽉 찼을 때
    - extra node
        - `extraChannels`
        - sub node에 할당되어야하나 자리가 꽉 찼을 때
- mode4
    - main node
        - `allowedChannels`
    - sub node
        - `unclassifiedChannels`
        - main node에 할당되어야하나 자리가 꽉 찼을 때
    - extra webhook
        - `extraChannels`
        - sub node에 할당되어야하나 자리가 꽉 찼을 때
